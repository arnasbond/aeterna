package com.unmute.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import kotlin.math.max

object AppUpdateManager {
    private const val PREFS = "unmute_update_prefs"
    private const val KEY_LAST_CHECK = "last_check_ms"
    private const val CHECK_INTERVAL_MS = 60 * 60 * 1000L // 1 val. (foninis)

    private val executor = Executors.newSingleThreadExecutor()

    data class UpdateInfo(
        val versionCode: Int,
        val versionName: String,
        val releaseNotes: String,
        val required: Boolean,
        val apkUrl: String,
        val apkAvailable: Boolean
    )

    fun checkForUpdate(activity: Activity, force: Boolean = false, onLaunch: Boolean = false) {
        val prefs = activity.getSharedPreferences(PREFS, Activity.MODE_PRIVATE)
        val now = System.currentTimeMillis()
        val throttled = !force && !onLaunch && now - prefs.getLong(KEY_LAST_CHECK, 0L) < CHECK_INTERVAL_MS
        if (throttled) return

        executor.execute {
            try {
                val info = fetchUpdateInfo(activity) ?: return@execute
                prefs.edit().putLong(KEY_LAST_CHECK, now).apply()
                val current = currentVersionCode(activity)
                if (!info.apkAvailable) return@execute

                if (info.versionCode > current) {
                    activity.runOnUiThread {
                        showUpdateDialog(activity, info, current)
                    }
                }
            } catch (_: Exception) {
                if (force) {
                    activity.runOnUiThread {
                        Toast.makeText(activity, R.string.update_check_failed, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    fun currentVersionCode(activity: Activity): Int {
        val pkg = activity.packageManager.getPackageInfo(activity.packageName, 0)
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            pkg.longVersionCode.toInt()
        } else {
            @Suppress("DEPRECATION")
            pkg.versionCode
        }
    }

    private fun fetchUpdateInfo(activity: Activity): UpdateInfo? {
        val apiBase = ApiUrl.resolveApiBase(UrlStore.getUrl(activity))
        val url = URL("$apiBase/api/v1/app/android/update")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 12_000
            readTimeout = 12_000
            requestMethod = "GET"
        }
        try {
            if (conn.responseCode !in 200..299) return null
            val body = conn.inputStream.bufferedReader().readText()
            val root = JSONObject(body)
            if (!root.optBoolean("success", false)) return null
            val data = root.getJSONObject("data")
            val webFromServer = data.optString("webAppUrl", "").trim()
            if (webFromServer.isNotEmpty() && !UrlStore.isManualOverride(activity)) {
                UrlStore.applyRemoteUrl(activity, webFromServer)
            }
            return UpdateInfo(
                versionCode = data.getInt("versionCode"),
                versionName = data.optString("versionName", ""),
                releaseNotes = data.optString("releaseNotes", ""),
                required = data.optBoolean("required", false),
                apkUrl = data.getString("apkUrl"),
                apkAvailable = data.optBoolean("apkAvailable", true)
            )
        } finally {
            conn.disconnect()
        }
    }

    private fun showUpdateDialog(activity: Activity, info: UpdateInfo, current: Int) {
        if (activity.isFinishing) return
        val message = buildString {
            append(activity.getString(R.string.update_available_body, info.versionName, current))
            if (info.releaseNotes.isNotBlank()) {
                append("\n\n")
                append(info.releaseNotes.trim())
            }
        }
        val builder = AlertDialog.Builder(activity)
            .setTitle(R.string.update_available_title)
            .setMessage(message)
            .setPositiveButton(R.string.update_download) { _, _ ->
                downloadAndInstall(activity, info)
            }
        if (!info.required) {
            builder.setNegativeButton(R.string.update_later, null)
        } else {
            builder.setCancelable(false)
        }
        builder.show()
    }

    private fun downloadAndInstall(activity: Activity, info: UpdateInfo) {
        val progress = AlertDialog.Builder(activity)
            .setTitle(R.string.update_downloading)
            .setMessage(R.string.update_please_wait)
            .setCancelable(false)
            .create()
        progress.show()

        executor.execute {
            try {
                val file = downloadApk(info.apkUrl, File(activity.cacheDir, "aeterna-update.apk"))
                activity.runOnUiThread {
                    progress.dismiss()
                    if (!canInstallPackages(activity)) {
                        promptInstallPermission(activity)
                        return@runOnUiThread
                    }
                    installApk(activity, file)
                }
            } catch (e: Exception) {
                activity.runOnUiThread {
                    progress.dismiss()
                    Toast.makeText(
                        activity,
                        activity.getString(R.string.update_download_failed, e.message ?: ""),
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun downloadApk(urlString: String, dest: File): File {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 20_000
            readTimeout = 120_000
            requestMethod = "GET"
        }
        try {
            if (conn.responseCode !in 200..299) {
                throw IllegalStateException("HTTP ${conn.responseCode}")
            }
            val total = max(conn.contentLength, 0)
            dest.parentFile?.mkdirs()
            conn.inputStream.use { input ->
                BufferedInputStream(input).use { buffered ->
                    FileOutputStream(dest).use { output ->
                        val data = ByteArray(8192)
                        var read: Int
                        var downloaded = 0
                        while (buffered.read(data).also { read = it } != -1) {
                            output.write(data, 0, read)
                            downloaded += read
                            if (total > 0 && downloaded >= total) break
                        }
                        output.flush()
                    }
                }
            }
            return dest
        } finally {
            conn.disconnect()
        }
    }

    private fun canInstallPackages(activity: Activity): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            activity.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
    }

    private fun promptInstallPermission(activity: Activity) {
        AlertDialog.Builder(activity)
            .setTitle(R.string.update_install_permission_title)
            .setMessage(R.string.update_install_permission_body)
            .setPositiveButton(R.string.update_open_settings) { _, _ ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    }
                    activity.startActivity(intent)
                }
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun installApk(activity: Activity, file: File) {
        val uri = FileProvider.getUriForFile(
            activity,
            "${activity.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        activity.startActivity(intent)
    }
}

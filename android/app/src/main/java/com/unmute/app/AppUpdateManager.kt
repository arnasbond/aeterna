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

object AppUpdateManager {

    private const val PREFS = "unmute_update_prefs"

    private const val KEY_LAST_CHECK = "last_check_ms"

    private const val KEY_DISMISSED_VERSION = "dismissed_version_code"

    /** Fone — ne dažniau nei kas 15 min (paleidimas visada tikrina). */

    private const val CHECK_INTERVAL_MS = 15 * 60 * 1000L



    private val executor = Executors.newSingleThreadExecutor()

    private var dialogShowing = false



    data class UpdateInfo(

        val versionCode: Int,

        val versionName: String,

        val releaseNotes: String,

        val required: Boolean,

        val apkUrl: String,

        val apkAvailable: Boolean

    )



    /**

     * @param onLaunch true = kiekvieną kartą atidarius programėlę (be throttle)

     * @param force true = meniu „Tikrinti atnaujinimus“

     */

    fun checkForUpdate(activity: Activity, force: Boolean = false, onLaunch: Boolean = false) {

        if (activity.isFinishing) return

        val prefs = activity.getSharedPreferences(PREFS, Activity.MODE_PRIVATE)

        val now = System.currentTimeMillis()

        val throttled =

            !force && !onLaunch && now - prefs.getLong(KEY_LAST_CHECK, 0L) < CHECK_INTERVAL_MS

        if (throttled) return



        executor.execute {

            try {

                val info = fetchUpdateInfo() ?: return@execute

                prefs.edit().putLong(KEY_LAST_CHECK, now).apply()



                val current = currentVersionCode(activity)

                if (!info.apkAvailable || !shouldOfferUpdate(info, current, prefs, force)) {

                    if (force) {

                        activity.runOnUiThread {

                            Toast.makeText(

                                activity,

                                activity.getString(R.string.update_already_latest, current),

                                Toast.LENGTH_LONG

                            ).show()

                        }

                    }

                    return@execute

                }



                activity.runOnUiThread {

                    if (!activity.isFinishing && !dialogShowing) {

                        showUpdateDialog(activity, info, current, prefs)

                    }

                }

            } catch (_: Exception) {

                if (force) {

                    activity.runOnUiThread {

                        Toast.makeText(activity, R.string.update_check_failed, Toast.LENGTH_LONG)

                            .show()

                    }

                }

            }

        }

    }



    private fun shouldOfferUpdate(

        info: UpdateInfo,

        current: Int,

        prefs: android.content.SharedPreferences,

        force: Boolean

    ): Boolean {

        if (info.versionCode <= current) return false

        if (wouldDowngradeToDev(info)) return false

        if (info.versionName.contains("-dev", ignoreCase = true) && current >= 12) return false

        if (!force && !info.required) {

            val dismissed = prefs.getInt(KEY_DISMISSED_VERSION, 0)

            if (dismissed >= info.versionCode) return false

        }

        return true

    }



    private fun wouldDowngradeToDev(info: UpdateInfo): Boolean {

        return info.versionName.contains("-dev", ignoreCase = true)

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



    private fun updateApiBase(): String = BuildConfig.API_BASE_URL.trimEnd('/')



    private fun fetchUpdateInfo(): UpdateInfo? {

        val url = URL("${updateApiBase()}/api/v1/app/android/update")

        val conn = (url.openConnection() as HttpURLConnection).apply {

            connectTimeout = 15_000

            readTimeout = 15_000

            requestMethod = "GET"

            setRequestProperty("Cache-Control", "no-cache")

        }

        try {

            if (conn.responseCode !in 200..299) return null

            val body = conn.inputStream.bufferedReader().readText()

            val root = JSONObject(body)

            if (!root.optBoolean("success", false)) return null

            val data = root.getJSONObject("data")

            var apkUrl = data.optString("apkUrl", "").trim()

            if (apkUrl.isEmpty()) {

                apkUrl = "${updateApiBase()}/api/v1/app/android/download"

            }

            return UpdateInfo(

                versionCode = data.getInt("versionCode"),

                versionName = data.optString("versionName", ""),

                releaseNotes = data.optString("releaseNotes", ""),

                required = data.optBoolean("required", false),

                apkUrl = apkUrl,

                apkAvailable = data.optBoolean("apkAvailable", true)

            )

        } finally {

            conn.disconnect()

        }

    }



    private fun showUpdateDialog(

        activity: Activity,

        info: UpdateInfo,

        current: Int,

        prefs: android.content.SharedPreferences

    ) {

        if (activity.isFinishing) return

        dialogShowing = true

        val message = buildString {

            append(

                activity.getString(

                    R.string.update_available_body,

                    info.versionName,

                    info.versionCode,

                    current

                )

            )

            if (info.releaseNotes.isNotBlank()) {

                append("\n\n")

                append(info.releaseNotes.trim())

            }

        }

        val builder = AlertDialog.Builder(activity)

            .setTitle(R.string.update_available_title)

            .setMessage(message)

            .setCancelable(!info.required)

            .setPositiveButton(R.string.update_download_now) { _, _ ->

                downloadAndInstall(activity, info)

            }

        if (!info.required) {

            builder.setNegativeButton(R.string.update_later) { _, _ ->

                prefs.edit().putInt(KEY_DISMISSED_VERSION, info.versionCode).apply()

            }

        }

        builder.setOnDismissListener { dialogShowing = false }

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

                    Toast.makeText(activity, R.string.update_confirm_install, Toast.LENGTH_LONG).show()

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

            connectTimeout = 25_000

            readTimeout = 180_000

            requestMethod = "GET"

            setRequestProperty("Cache-Control", "no-cache")

        }

        try {

            if (conn.responseCode !in 200..299) {

                throw IllegalStateException("HTTP ${conn.responseCode}")

            }

            dest.parentFile?.mkdirs()

            if (dest.exists()) dest.delete()

            conn.inputStream.use { input ->

                BufferedInputStream(input).use { buffered ->

                    FileOutputStream(dest).use { output ->

                        val data = ByteArray(8192)

                        var read: Int

                        while (buffered.read(data).also { read = it } != -1) {

                            output.write(data, 0, read)

                        }

                        output.flush()

                    }

                }

            }

            if (!dest.exists() || dest.length() < 10_000) {

                throw IllegalStateException("APK failas per mažas arba tuščias")

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

                    Toast.makeText(

                        activity,

                        R.string.update_permission_return,

                        Toast.LENGTH_LONG

                    ).show()

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



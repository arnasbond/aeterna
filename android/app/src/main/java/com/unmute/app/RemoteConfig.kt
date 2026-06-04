package com.unmute.app

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * Serverio konfigūracija — automatinis svetainės adresas ir pataisymai be rankinio įvedimo.
 */
object RemoteConfig {
    private const val PREFS = "unmute_remote_config"
    private const val KEY_LAST_SYNC = "last_sync_ms"
    private const val KEY_LAST_APP_VERSION = "last_app_version_code"
    private const val KEY_CONTENT_VERSION = "content_version"
    private const val SYNC_INTERVAL_MS = 5 * 60 * 1000L // 5 min. fone

    private val executor = Executors.newSingleThreadExecutor()

    data class SyncResult(
        val urlChanged: Boolean,
        val contentChanged: Boolean,
        val webAppUrl: String
    )

    fun sync(context: Context, force: Boolean = false, onDone: ((SyncResult) -> Unit)? = null) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val now = System.currentTimeMillis()
        migrateAfterAppUpdate(context, prefs)

        if (!force && now - prefs.getLong(KEY_LAST_SYNC, 0L) < SYNC_INTERVAL_MS) {
            onDone?.invoke(SyncResult(false, false, UrlStore.getUrl(context)))
            return
        }

        executor.execute {
            var urlChanged = false
            var contentChanged = false
            var url = UrlStore.getUrl(context)
            try {
                val apiBase = ApiUrl.resolveApiBase(url)
                val config = fetchConfig(apiBase) ?: return@execute
                prefs.edit().putLong(KEY_LAST_SYNC, now).apply()

                val contentVersion = config.optString("contentVersion", "").trim()
                if (contentVersion.isNotEmpty()) {
                    val prev = prefs.getString(KEY_CONTENT_VERSION, "") ?: ""
                    if (prev.isNotEmpty() && prev != contentVersion) {
                        contentChanged = true
                    }
                    prefs.edit().putString(KEY_CONTENT_VERSION, contentVersion).apply()
                }

                if (!UrlStore.isManualOverride(context)) {
                    val remote = UrlStore.ensureWebHost(config.optString("webAppUrl", ""))
                    if (remote.isNotEmpty() && remote != url && remote.startsWith("https://")) {
                        UrlStore.applyRemoteUrl(context, remote)
                        url = remote
                        urlChanged = true
                        contentChanged = true
                    }
                }
            } catch (_: Exception) {
                /* paliekame paskutinį veikiantį adresą */
            } finally {
                onDone?.let { cb ->
                    (context as? android.app.Activity)?.runOnUiThread {
                        cb(SyncResult(urlChanged, contentChanged, url))
                    }
                        ?: android.os.Handler(android.os.Looper.getMainLooper()).post {
                            cb(SyncResult(urlChanged, contentChanged, url))
                        }
                }
            }
        }
    }

    /** Po APK atnaujinimo — vėl automatinis serverio adresas (nebereikia rankinio nustatymo). */
    private fun migrateAfterAppUpdate(context: Context, prefs: android.content.SharedPreferences) {
        val current = currentVersionCode(context)
        val last = prefs.getInt(KEY_LAST_APP_VERSION, 0)
        if (current > last) {
            prefs.edit()
                .putInt(KEY_LAST_APP_VERSION, current)
                .remove(KEY_CONTENT_VERSION)
                .apply()
            UrlStore.clearManualOverride(context)
        }
    }

    fun clearWebCache(context: Context) {
        try {
            android.webkit.WebView(context).apply {
                clearCache(true)
                destroy()
            }
        } catch (_: Exception) {
            /* ignore */
        }
    }

    private fun currentVersionCode(context: Context): Int {
        return try {
            val pkg = context.packageManager.getPackageInfo(context.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pkg.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                pkg.versionCode
            }
        } catch (_: PackageManager.NameNotFoundException) {
            1
        }
    }

    private fun fetchConfig(apiBase: String): JSONObject? {
        val url = URL("$apiBase/api/v1/app/config")
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
            return root.getJSONObject("data")
        } finally {
            conn.disconnect()
        }
    }
}

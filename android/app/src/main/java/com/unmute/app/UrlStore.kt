package com.unmute.app

import android.content.Context

object UrlStore {
    private const val PREFS = "unmute_prefs"
    private const val KEY_URL = "web_app_url"
    private const val KEY_MANUAL_OVERRIDE = "url_manual_override"

    /** Veikiantis production (mauve deploy dar senas). */
    private const val WORKING_WEB = "https://aeterna-web-six.vercel.app"
    private const val BROKEN_MAUVE = "aeterna-mauve.vercel.app"

    fun forceProductionCloud(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_URL, WORKING_WEB)
            .putBoolean(KEY_MANUAL_OVERRIDE, false)
            .apply()
    }

    /** Tik svetainės šaknis (be /m/... kelio) — titulinis puslapis visada /. */
    fun normalizeBaseUrl(url: String): String {
        var trimmed = url.trim().trimEnd('/')
        if (trimmed.isEmpty()) return WORKING_WEB
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://$trimmed"
        }
        val schemeIdx = trimmed.indexOf("://")
        if (schemeIdx < 0) return WORKING_WEB
        val pathStart = trimmed.indexOf('/', schemeIdx + 3)
        return if (pathStart > 0) trimmed.substring(0, pathStart) else trimmed
    }

    private fun productionWebUrl(): String {
        val fromBuild = BuildConfig.WEB_APP_URL.trimEnd('/')
        return if (fromBuild.lowercase().contains(BROKEN_MAUVE)) WORKING_WEB else fromBuild
    }

    private fun migrateMauveToWorking(url: String): String {
        return if (url.lowercase().contains(BROKEN_MAUVE)) WORKING_WEB else url
    }

    /** API hostas netinka WebView — tik svetainės URL. */
    fun ensureWebHost(url: String): String {
        val base = migrateMauveToWorking(normalizeBaseUrl(url))
        val lower = base.lowercase()
        if (lower.contains("api-three") ||
            (lower.contains("api-") && lower.contains("vercel.app")) ||
            lower.contains("aeterna-api") ||
            (lower.contains(":4000") && !lower.contains(":3000"))
        ) {
            return productionWebUrl()
        }
        if (lower.contains("vercel.app") && !lower.contains("aeterna-web-six.vercel.app")) {
            return productionWebUrl()
        }
        return base
    }

    private fun isDevWebUrl(url: String): Boolean {
        val lower = url.lowercase()
        return lower.contains("localhost") ||
            lower.contains("127.0.0.1") ||
            lower.contains("10.0.2.2") ||
            lower.contains("192.168.") ||
            (lower.contains(":3000") && !lower.contains("vercel.app"))
    }

    /** Jei išsaugotas dev/LAN adresas — grąžiname production iš BuildConfig. */
    fun getUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_URL, null)?.trim().orEmpty()
        val raw = saved.ifEmpty { BuildConfig.WEB_APP_URL }
        var base = ensureWebHost(raw)
        if (isDevWebUrl(base)) {
            base = WORKING_WEB
        }
        val fixed = migrateMauveToWorking(base)
        if (!fixed.startsWith("https://")) {
            return WORKING_WEB.also { forceProductionCloud(context) }
        }
        if (fixed != saved) {
            prefs.edit().putString(KEY_URL, fixed).putBoolean(KEY_MANUAL_OVERRIDE, false).apply()
        }
        return fixed
    }

    fun isManualOverride(context: Context): Boolean {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean(KEY_MANUAL_OVERRIDE, false)
    }

    fun setUrl(context: Context, url: String) {
        val base = ensureWebHost(url)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_URL, base)
            .putBoolean(KEY_MANUAL_OVERRIDE, true)
            .apply()
    }

    /** Serverio nurodytas adresas — be rankinio režimo. */
    fun applyRemoteUrl(context: Context, url: String) {
        val base = ensureWebHost(url)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_URL, base)
            .putBoolean(KEY_MANUAL_OVERRIDE, false)
            .apply()
    }

    fun resetUrl(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_URL)
            .putBoolean(KEY_MANUAL_OVERRIDE, false)
            .apply()
    }

    fun clearManualOverride(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_MANUAL_OVERRIDE, false)
            .apply()
    }
}

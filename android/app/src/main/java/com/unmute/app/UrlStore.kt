package com.unmute.app

import android.content.Context

object UrlStore {
    private const val PREFS = "unmute_prefs"
    private const val KEY_URL = "web_app_url"
    private const val KEY_MANUAL_OVERRIDE = "url_manual_override"

    /** Tik svetainės šaknis (be /m/... kelio) — titulinis puslapis visada /. */
    fun normalizeBaseUrl(url: String): String {
        val trimmed = url.trim().trimEnd('/')
        if (trimmed.isEmpty()) return BuildConfig.WEB_APP_URL.trimEnd('/')
        val schemeIdx = trimmed.indexOf("://")
        if (schemeIdx < 0) return trimmed
        val pathStart = trimmed.indexOf('/', schemeIdx + 3)
        return if (pathStart > 0) trimmed.substring(0, pathStart) else trimmed
    }

    private fun productionWebUrl(): String = BuildConfig.WEB_APP_URL.trimEnd('/')

    /** API hostas netinka WebView — tik svetainės URL. */
    fun ensureWebHost(url: String): String {
        val base = normalizeBaseUrl(url)
        val lower = base.lowercase()
        if (lower.contains("api-three") ||
            (lower.contains("api-") && lower.contains("vercel.app")) ||
            lower.contains("aeterna-api") ||
            (lower.contains(":4000") && !lower.contains(":3000"))
        ) {
            return productionWebUrl()
        }
        // Vercel preview — leidžiami tik žinomi production hostai
        val allowedProduction =
            lower.contains("aeterna-mauve.vercel.app") ||
                lower.contains("aeterna-web-six.vercel.app")
        if (lower.contains("vercel.app") && !allowedProduction) {
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
        val base = ensureWebHost(raw)
        if (isDevWebUrl(base)) {
            val prod = ensureWebHost(BuildConfig.WEB_APP_URL)
            prefs.edit().putString(KEY_URL, prod).putBoolean(KEY_MANUAL_OVERRIDE, false).apply()
            return prod
        }
        return base
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

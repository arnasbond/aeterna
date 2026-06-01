package com.unmute.app

import android.content.Context

object UrlStore {
    private const val PREFS = "unmute_prefs"
    private const val KEY_URL = "web_app_url"

    /** Tik svetainės šaknis (be /m/... kelio) — titulinis puslapis visada /. */
    fun normalizeBaseUrl(url: String): String {
        val trimmed = url.trim().trimEnd('/')
        if (trimmed.isEmpty()) return BuildConfig.WEB_APP_URL.trimEnd('/')
        val schemeIdx = trimmed.indexOf("://")
        if (schemeIdx < 0) return trimmed
        val pathStart = trimmed.indexOf('/', schemeIdx + 3)
        return if (pathStart > 0) trimmed.substring(0, pathStart) else trimmed
    }

    fun getUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_URL, null)?.trim().orEmpty()
        val raw = saved.ifEmpty { BuildConfig.WEB_APP_URL }
        return normalizeBaseUrl(raw)
    }

    fun setUrl(context: Context, url: String) {
        val base = normalizeBaseUrl(url)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_URL, base)
            .apply()
    }

    fun resetUrl(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_URL)
            .apply()
    }
}

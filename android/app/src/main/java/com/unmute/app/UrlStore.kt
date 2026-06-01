package com.unmute.app

import android.content.Context

object UrlStore {
    private const val PREFS = "unmute_prefs"
    private const val KEY_URL = "web_app_url"

    fun getUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        return prefs.getString(KEY_URL, null)?.trim().orEmpty().ifEmpty {
            BuildConfig.WEB_APP_URL
        }
    }

    fun setUrl(context: Context, url: String) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_URL, url.trim())
            .apply()
    }

    fun resetUrl(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_URL)
            .apply()
    }
}

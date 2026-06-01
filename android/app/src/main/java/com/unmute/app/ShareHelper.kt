package com.unmute.app

import android.app.Activity
import android.content.Intent
import android.widget.Toast

object ShareHelper {
    fun share(activity: Activity, url: String, title: String, text: String) {
        val link = url.trim().ifEmpty { UrlStore.getUrl(activity).trimEnd('/') }
        val message = buildString {
            if (text.isNotBlank()) append(text.trim())
            if (isNotEmpty()) append("\n\n")
            append(link)
        }
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, title.ifBlank { activity.getString(R.string.app_name) })
            putExtra(Intent.EXTRA_TEXT, message)
        }
        val chooser = Intent.createChooser(intent, activity.getString(R.string.action_share))
        try {
            activity.startActivity(chooser)
        } catch (_: Exception) {
            Toast.makeText(activity, R.string.share_failed, Toast.LENGTH_SHORT).show()
        }
    }
}

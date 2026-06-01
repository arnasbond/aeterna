package com.unmute.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.widget.Toast

object AppDownloadHelper {
    /** Rekomenduoti programėlę — dalinimasis nuoroda į atsisiuntimo puslapį. */
    fun shareAppInvite(activity: Activity) {
        val base = UrlStore.getUrl(activity).trimEnd('/')
        val page = "$base/atsisiusti"
        ShareHelper.share(
            activity,
            page,
            activity.getString(R.string.app_name),
            activity.getString(R.string.share_app_invite_text)
        )
    }

    /** Atidaro APK atsisiuntimą naršyklėje (naujausią iš serverio). */
    fun openApkDownload(activity: Activity) {
        val apiBase = ApiUrl.resolveApiBase(UrlStore.getUrl(activity))
        val apkUrl = "$apiBase/api/v1/app/android/download"
        try {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl)))
        } catch (_: Exception) {
            Toast.makeText(activity, R.string.update_check_failed, Toast.LENGTH_SHORT).show()
        }
    }
}

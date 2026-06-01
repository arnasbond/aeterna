package com.unmute.app

import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
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

    /** Atsisiunčia naujausią APK (DownloadManager) arba atidaro naršyklėje. */
    fun openApkDownload(activity: Activity) {
        val webBase = UrlStore.getUrl(activity).trimEnd('/')
        val apiBase = ApiUrl.resolveApiBase(webBase)
        val apkUrl = "$apiBase/api/v1/app/android/download"

        if (tryDownloadManager(activity, apkUrl)) return
        if (tryExternalBrowser(activity, "$webBase/atsisiusti")) return

        Toast.makeText(activity, R.string.update_check_failed, Toast.LENGTH_LONG).show()
    }

    private fun tryDownloadManager(activity: Activity, apkUrl: String): Boolean {
        return try {
            val request = DownloadManager.Request(Uri.parse(apkUrl)).apply {
                setTitle(activity.getString(R.string.app_name))
                setDescription(activity.getString(R.string.download_notification_desc))
                setMimeType("application/vnd.android.package-archive")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "aeterna.apk")
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
            }
            val dm = activity.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(activity, R.string.download_started, Toast.LENGTH_LONG).show()
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun tryExternalBrowser(activity: Activity, url: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            activity.startActivity(Intent.createChooser(intent, activity.getString(R.string.action_download_app)))
            Toast.makeText(activity, R.string.download_open_browser, Toast.LENGTH_SHORT).show()
            true
        } catch (_: Exception) {
            false
        }
    }

    fun isApkDownloadUrl(url: String?): Boolean {
        if (url.isNullOrBlank()) return false
        return url.contains("/app/android/download") || url.endsWith(".apk", ignoreCase = true)
    }
}

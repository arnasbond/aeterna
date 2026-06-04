package com.unmute.app

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var errorPanel: LinearLayout
    private lateinit var errorMessage: TextView
    private lateinit var errorUrl: TextView
    private var backPressToast: Toast? = null
    private var loadedBaseUrl: String? = null
    private var pageLoaded = false
    private var serverContentVersion: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private val loadTimeout = Runnable { if (!pageLoaded) showError(getString(R.string.error_timeout)) }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        toolbar.setOnClickListener { refreshFromServer(clearCache = true) }

        webView = findViewById(R.id.webview)
        errorPanel = findViewById(R.id.error_panel)
        errorMessage = findViewById(R.id.error_message)
        errorUrl = findViewById(R.id.error_url)

        findViewById<Button>(R.id.btn_retry).setOnClickListener {
            hideError()
            refreshFromServer(clearCache = true)
        }
        findViewById<Button>(R.id.btn_settings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        webView.setBackgroundColor(Color.parseColor("#fcfbf7"))
        clearAllWebStorage()

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            @Suppress("DEPRECATION")
            cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
        }

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, true)
        }

        webView.addJavascriptInterface(WebAppBridge(), "AeternaApp")

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                pageLoaded = true
                handler.removeCallbacks(loadTimeout)
                if (url?.startsWith("file:///android_asset/error") != true) {
                    hideError()
                }
                updateSubtitle()
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame == true) {
                    val detail = error?.description?.toString() ?: getString(R.string.error_unknown)
                    showError(detail)
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (AppDownloadHelper.isApkDownloadUrl(url)) {
                    AppDownloadHelper.openApkDownload(this@MainActivity)
                    return true
                }
                return false
            }
        }

        RemoteConfig.sync(this, force = true) { _ ->
            fetchServerContentVersion()
            refreshFromServer(clearCache = true)
            AppUpdateManager.checkForUpdate(this@MainActivity, onLaunch = true)
        }
    }

    private fun fetchServerContentVersion() {
        Thread {
            try {
                val api = ApiUrl.resolveApiBase(UrlStore.getUrl(this))
                val conn = (URL("$api/api/v1/app/config").openConnection() as HttpURLConnection).apply {
                    connectTimeout = 10_000
                    readTimeout = 10_000
                    requestMethod = "GET"
                    setRequestProperty("Cache-Control", "no-cache")
                }
                if (conn.responseCode in 200..299) {
                    val body = conn.inputStream.bufferedReader().readText()
                    val data = JSONObject(body).optJSONObject("data")
                    serverContentVersion = data?.optString("contentVersion", "")?.trim()?.ifEmpty { null }
                }
                conn.disconnect()
            } catch (_: Exception) {
                /* ignore */
            }
            runOnUiThread { updateSubtitle() }
        }.start()
    }

    private fun updateSubtitle() {
        val v = AppUpdateManager.currentVersionCode(this)
        val cv = serverContentVersion?.let { " · srv:$it" } ?: ""
        supportActionBar?.subtitle = "${UrlStore.getUrl(this).trimEnd('/')} · apk:$v$cv"
    }

    private fun clearAllWebStorage() {
        try {
            webView.clearCache(true)
            webView.clearHistory()
            CookieManager.getInstance().removeAllCookies(null)
            CookieManager.getInstance().flush()
            RemoteConfig.clearWebCache(this)
        } catch (_: Exception) {
            /* ignore */
        }
    }

    fun refreshFromServer(clearCache: Boolean = false) {
        if (clearCache) clearAllWebStorage()
        loadHome(force = true)
    }

    private fun homeUrl(): String = UrlStore.getUrl(this)

    private fun loadHome(force: Boolean = false) {
        val base = homeUrl()
        if (!force && base == loadedBaseUrl && pageLoaded) return
        loadedBaseUrl = base
        pageLoaded = false
        hideError()
        handler.removeCallbacks(loadTimeout)
        handler.postDelayed(loadTimeout, 20_000)
        val sep = if (base.contains("?")) "&" else "?"
        val cv = serverContentVersion ?: System.currentTimeMillis().toString()
        webView.loadUrl("$base${sep}_cv=$cv&_app=${AppUpdateManager.currentVersionCode(this)}")
        updateSubtitle()
    }

    private fun showError(detail: String) {
        handler.removeCallbacks(loadTimeout)
        val url = homeUrl()
        errorMessage.text = detail
        errorUrl.text = url
        errorPanel.visibility = View.VISIBLE
        val enc = URLEncoder.encode(url, Charsets.UTF_8.name())
        webView.loadUrl("file:///android_asset/error.html?url=$enc")
    }

    private fun hideError() {
        errorPanel.visibility = View.GONE
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_reload -> {
                RemoteConfig.sync(this, force = true) {
                    fetchServerContentVersion()
                    refreshFromServer(clearCache = true)
                    Toast.makeText(this, R.string.reload_from_server_done, Toast.LENGTH_LONG).show()
                }
                true
            }
            R.id.action_check_update -> {
                RemoteConfig.sync(this, force = true) {
                    fetchServerContentVersion()
                    refreshFromServer(clearCache = true)
                    AppUpdateManager.checkForUpdate(this, force = true)
                }
                true
            }
            R.id.action_share -> {
                val url = webView.url?.takeIf { it.startsWith("http") } ?: homeUrl()
                val title = webView.title?.takeIf { it.isNotBlank() }
                    ?: getString(R.string.app_name)
                ShareHelper.share(this, url, title, "")
                true
            }
            R.id.action_share_app -> {
                AppDownloadHelper.shareAppInvite(this)
                true
            }
            R.id.action_download_app -> {
                AppDownloadHelper.openApkDownload(this)
                true
            }
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        val url = homeUrl()
        if (url != loadedBaseUrl) {
            refreshFromServer(clearCache = true)
        } else {
            updateSubtitle()
        }
        RemoteConfig.sync(this, force = true) { result ->
            if (result.urlChanged || result.contentChanged) {
                fetchServerContentVersion()
                refreshFromServer(clearCache = true)
            }
        }
        AppUpdateManager.checkForUpdate(this)
    }

    override fun onPause() {
        handler.removeCallbacks(loadTimeout)
        webView.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    private inner class WebAppBridge {
        @JavascriptInterface
        fun sharePage(title: String, text: String) {
            runOnUiThread {
                val url = webView.url?.takeIf { it.startsWith("http") } ?: homeUrl()
                ShareHelper.share(this@MainActivity, url, title, text)
            }
        }

        @JavascriptInterface
        fun downloadApp() {
            runOnUiThread {
                AppDownloadHelper.openApkDownload(this@MainActivity)
            }
        }

        @JavascriptInterface
        fun goHome() {
            runOnUiThread { refreshFromServer(clearCache = true) }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (errorPanel.visibility == View.VISIBLE) {
            hideError()
            refreshFromServer(clearCache = true)
            return
        }
        if (webView.canGoBack()) {
            webView.goBack()
            return
        }
        backPressToast?.cancel()
        backPressToast = Toast.makeText(this, R.string.press_back_again, Toast.LENGTH_SHORT)
        backPressToast?.show()
        super.onBackPressed()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            startActivity(Intent(this, SettingsActivity::class.java))
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}

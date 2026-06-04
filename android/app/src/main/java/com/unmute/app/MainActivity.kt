package com.unmute.app

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
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
    private lateinit var nativeVersionBar: TextView
    private var backPressToast: Toast? = null
    private var loadedBaseUrl: String? = null
    private var pageLoaded = false
    private var serverContentVersion: String? = null
    private var serverCommitHash: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private val loadTimeout = Runnable { if (!pageLoaded) showError(getString(R.string.error_timeout)) }

    /** Be šio — WebView neleidžia &lt;input type="file"&gt; (PC naršyklė veikia, programėlė ne). */
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = filePathCallback
            filePathCallback = null
            if (callback == null) return@registerForActivityResult
            val uris =
                WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            callback.onReceiveValue(uris)
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        toolbar.title = "AETERNA ${BuildConfig.VERSION_NAME}"
        toolbar.setOnClickListener { refreshFromServer(clearCache = true) }

        webView = findViewById(R.id.webview)
        errorPanel = findViewById(R.id.error_panel)
        errorMessage = findViewById(R.id.error_message)
        errorUrl = findViewById(R.id.error_url)
        nativeVersionBar = findViewById(R.id.native_version_bar)

        findViewById<Button>(R.id.btn_retry).setOnClickListener {
            UrlStore.forceProductionCloud(this)
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
            allowFileAccess = true
            allowContentAccess = true
            @Suppress("DEPRECATION")
            cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
            userAgentString = "${userAgentString} AeternaApp/${BuildConfig.VERSION_NAME}"
        }

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, true)
        }

        webView.addJavascriptInterface(WebAppBridge(), "AeternaApp")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: FileChooserParams?
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback ?: return false
                val intent =
                    params?.createIntent()
                        ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                            addCategory(Intent.CATEGORY_OPENABLE)
                            type = "*/*"
                        }
                if (params?.mode == FileChooserParams.MODE_OPEN_MULTIPLE) {
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                }
                return try {
                    fileChooserLauncher.launch(
                        Intent.createChooser(intent, getString(R.string.file_chooser_title))
                    )
                    true
                } catch (_: ActivityNotFoundException) {
                    filePathCallback?.onReceiveValue(null)
                    filePathCallback = null
                    Toast.makeText(this@MainActivity, R.string.file_chooser_unavailable, Toast.LENGTH_LONG)
                        .show()
                    false
                }
            }
        }
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                pageLoaded = true
                handler.removeCallbacks(loadTimeout)
                if (url?.startsWith("file:///android_asset/error") != true) {
                    hideError()
                    syncBuildLabelOnPage()
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
                if (isExternalMapsUrl(url)) {
                    openExternalUrl(url)
                    return true
                }
                return false
            }
        }

        UrlStore.forceProductionCloud(this)
        refreshNativeVersionBar()
        showApkVersionToastOnce()
        loadHome(force = true)
        RemoteConfig.sync(this, force = true) { _ ->
            fetchServerContentVersion()
            loadHome(force = true)
            AppUpdateManager.checkForUpdate(this@MainActivity, onLaunch = true)
        }
    }

    private fun checkAppUpdateOnResume() {
        AppUpdateManager.checkForUpdate(this, onLaunch = false)
    }

    /** Versijos juosta — commit-hash „unknown“ ≠ svetainė neveikia. */
    private fun refreshNativeVersionBar() {
        val base = homeUrl().trimEnd('/')
        val apk = BuildConfig.VERSION_NAME
        val code = BuildConfig.VERSION_CODE
        val host = base.removePrefix("https://").removePrefix("http://")
        nativeVersionBar.text = getString(R.string.version_loading, apk, code)
        nativeVersionBar.visibility = View.VISIBLE
        Thread {
            val reachable = pingWebRoot(base)
            val label = fetchSiteLabel(base)
            runOnUiThread {
                nativeVersionBar.text = when {
                    reachable && label != null ->
                        getString(R.string.version_line, apk, code, label)
                    reachable ->
                        getString(R.string.version_host_only, apk, code, host)
                    else ->
                        getString(R.string.version_failed, apk, code)
                }
            }
        }.start()
    }

    private fun showApkVersionToastOnce() {
        val prefs = getSharedPreferences("unmute_prefs", MODE_PRIVATE)
        val key = "toast_apk_${BuildConfig.VERSION_CODE}"
        if (prefs.getBoolean(key, false)) return
        prefs.edit().putBoolean(key, true).apply()
        Toast.makeText(
            this,
            getString(R.string.apk_toast, BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE),
            Toast.LENGTH_LONG
        ).show()
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
        val commit = serverCommitHash?.let { " · $it" } ?: ""
        supportActionBar?.subtitle =
            "${UrlStore.getUrl(this).trimEnd('/')} · apk:$v$commit$cv"
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
        refreshNativeVersionBar()
        loadHome(force = true)
    }

    private fun isExternalMapsUrl(url: String): Boolean {
        val u = url.lowercase()
        return u.contains("google.com/maps") ||
            u.contains("maps.google.com") ||
            u.startsWith("geo:") ||
            u.startsWith("https://maps.app.goo.gl")
    }

    private fun openExternalUrl(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url)))
        } catch (_: Exception) {
            Toast.makeText(this, R.string.error_unknown, Toast.LENGTH_SHORT).show()
        }
    }

    private fun homeUrl(): String = UrlStore.getUrl(this)

    private fun loadHome(force: Boolean = false) {
        var base = homeUrl()
        val lower = base.lowercase()
        if (lower.contains("localhost") || lower.contains("192.168.") || lower.contains("10.0.2.2") || lower.contains("127.0.0.1")) {
            UrlStore.resetUrl(this)
            base = homeUrl()
            Toast.makeText(
                this,
                "Perjungta į $base",
                Toast.LENGTH_LONG
            ).show()
        }
        if (!force && base == loadedBaseUrl && pageLoaded) return
        loadedBaseUrl = base
        pageLoaded = false
        hideError()
        handler.removeCallbacks(loadTimeout)
        handler.postDelayed(loadTimeout, 45_000)
        val sep = if (base.contains("?")) "&" else "?"
        val cv = serverContentVersion ?: System.currentTimeMillis().toString()
        val url = "$base${sep}_cv=$cv&_app=${AppUpdateManager.currentVersionCode(this)}&_t=${System.currentTimeMillis()}"
        val headers = mapOf(
            "Cache-Control" to "no-cache, no-store, must-revalidate",
            "Pragma" to "no-cache"
        )
        webView.loadUrl(url, headers)
        updateSubtitle()
    }

    private fun pingWebRoot(base: String): Boolean {
        return try {
            val conn =
                (URL("$base/?_ping=${System.currentTimeMillis()}").openConnection() as HttpURLConnection).apply {
                    connectTimeout = 15_000
                    readTimeout = 15_000
                    requestMethod = "GET"
                    instanceFollowRedirects = true
                    setRequestProperty("Cache-Control", "no-cache")
                }
            val ok = conn.responseCode in 200..399
            if (ok) {
                conn.inputStream.use { it.read(ByteArray(256)) }
            }
            conn.disconnect()
            ok
        } catch (_: Exception) {
            false
        }
    }

    private fun fetchSiteLabel(base: String): String? {
        try {
            val hashConn =
                (URL("$base/commit-hash.txt?t=${System.currentTimeMillis()}").openConnection() as HttpURLConnection).apply {
                    connectTimeout = 12_000
                    readTimeout = 12_000
                    requestMethod = "GET"
                    setRequestProperty("Cache-Control", "no-cache")
                }
            val label =
                if (hashConn.responseCode in 200..299) {
                    hashConn.inputStream.bufferedReader().readText().trim().lowercase()
                } else ""
            hashConn.disconnect()
            if (label.matches(Regex("^[0-9a-f]{7}$"))) return label
            if (label == "unknown" || label == "dev") return "web-six"
        } catch (_: Exception) {
            /* ignore */
        }
        return null
    }

    private fun fetchCommitHash(base: String): String? = fetchSiteLabel(base)

    private fun applyCommitLabelToWeb(label: String) {
        val safe = label.replace("\\", "").replace("'", "")
        val js = """
            (function(){
              var id='$safe';
              var el=document.getElementById('aeterna-build-label');
              if(el) el.textContent=id;
              document.querySelectorAll('.ae-deploy-badge strong,#aeterna-build-label').forEach(function(n){
                if(n) n.textContent=id;
              });
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    /** WebView kartais rodo „…“ — versija iš commit-hash.txt (kaip PC Chrome). */
    private fun syncBuildLabelOnPage() {
        val base = homeUrl().trimEnd('/')
        fun runOnce(delayMs: Long) {
            handler.postDelayed({
                Thread {
                    val label = fetchCommitHash(base) ?: return@Thread
                    serverCommitHash = label
                    runOnUiThread {
                        applyCommitLabelToWeb(label)
                        updateSubtitle()
                    }
                }.start()
            }, delayMs)
        }
        runOnce(0)
        runOnce(600)
        runOnce(2000)
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
        checkAppUpdateOnResume()
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

        @JavascriptInterface
        fun openMaps(url: String) {
            runOnUiThread {
                if (url.isNotBlank()) openExternalUrl(url)
            }
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

package kr.nexus.mihaeje;

import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * 미해제 앱 화면 하나 — 웹 게임(www/)을 그대로 띄우고, 앱에서만 필요한 일만 여기서 한다
 *
 * 1. 뒤로 버튼: 웹 history 로 넘긴다 (웹이 창을 열 때 pushState 해 두면 뒤로 = 창 닫기)
 *    더 돌아갈 곳이 없을 때만 앱을 닫는다
 * 2. 화면 꺼짐 방지: 플레이 화면(play.html)에 있을 때만, 그리고 10분 동안 손대지 않으면 풀어 준다
 * 3. 상태바·내비게이션바: 웹 화면을 바 안쪽으로 줄이고 바 자리는 바탕색(app-info.json backgroundColor)으로 칠한다
 *    — 웹 CSS 가 safe-area 를 몰라도 글자·버튼이 바 밑에 깔리지 않는다
 * (외부 링크는 Capacitor 가 알아서 바깥 브라우저로 연다 · 진동은 navigator.vibrate + VIBRATE 권한)
 */
public class MainActivity extends BridgeActivity {

    private static final long IDLE_RELEASE_MS = 10 * 60 * 1000L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean onPlayPage = false;
    private final Runnable releaseIdle = () -> setKeepScreenOn(false);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        fitWebViewInsideSystemBars();
        routeBackButtonToWebHistory();
        watchPageForKeepAwake();
    }

    // ---------- 1. 뒤로 버튼 ----------
    private void routeBackButtonToWebHistory() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = bridge != null ? bridge.getWebView() : null;
                if (web != null && web.canGoBack()) {
                    web.goBack();
                    return;
                }
                // 첫 화면에서 뒤로: 기본 동작(앱 닫기)
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            }
        });
    }

    // ---------- 2. 플레이 중에만 화면 켜 두기 ----------
    private void watchPageForKeepAwake() {
        if (bridge == null) return;
        bridge.addWebViewListener(new WebViewListener() {
            @Override
            public void onPageCommitVisible(WebView view, String url) {
                updatePage(url);
            }

            @Override
            public void onPageLoaded(WebView view) {
                updatePage(view.getUrl());
            }
        });
    }

    private void updatePage(String url) {
        String path = url == null ? "" : String.valueOf(Uri.parse(url).getPath());
        onPlayPage = path.endsWith("/play.html");
        setKeepScreenOn(onPlayPage);
    }

    private void setKeepScreenOn(boolean on) {
        handler.removeCallbacks(releaseIdle);
        if (on) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            handler.postDelayed(releaseIdle, IDLE_RELEASE_MS);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // 손대면 다시 10분 — 플레이 화면일 때만
        if (onPlayPage && ev.getActionMasked() == MotionEvent.ACTION_DOWN) setKeepScreenOn(true);
        return super.dispatchTouchEvent(ev);
    }

    @Override
    public void onPause() {
        handler.removeCallbacks(releaseIdle);
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (onPlayPage) setKeepScreenOn(true);
    }

    // ---------- 3. 상태바·내비게이션바·키보드 자리 ----------
    private void fitWebViewInsideSystemBars() {
        // 안드로이드 버전마다 다르게 굴지 않도록 늘 '바 밑까지 그리기'로 두고, 바 자리만큼 직접 비운다
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        View decor = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(decor, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboard = insets.isVisible(WindowInsetsCompat.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, keyboard ? Math.max(ime.bottom, bars.bottom) : bars.bottom);
            // 웹뷰에는 '가릴 것 없음'으로 넘긴다 (CONSUMED 로 넘기면 크롬 웹뷰가 다시 계산을 안 함)
            return new WindowInsetsCompat.Builder(insets)
                .setInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(), Insets.NONE)
                .setInsets(WindowInsetsCompat.Type.ime(), Insets.NONE)
                .build();
        });
        ViewCompat.requestApplyInsets(decor);
    }
}

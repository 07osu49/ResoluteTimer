package com.e9.resolutetimer;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;

/** Offline Android package of the version 3.16 interface and timer logic. */
public final class MainActivity extends Activity {
    private static final String HOST="appassets.androidplatform.net";
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.WHITE);
        getWindow().setNavigationBarColor(Color.WHITE);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        FrameLayout frame=new FrameLayout(this);
        frame.setBackgroundColor(Color.WHITE);
        frame.setOnApplyWindowInsetsListener((v,insets)->{
            if(android.os.Build.VERSION.SDK_INT>=30) {
                android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()|WindowInsets.Type.ime());
                v.setPadding(bars.left,bars.top,bars.right,bars.bottom);
            } else v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets;
        });
        web=new WebView(this);
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if(!"https".equals(uri.getScheme())||!HOST.equals(uri.getHost()))return missing();
                String name=uri.getPath();
                if(name==null||!name.startsWith("/assets/"))return missing();
                name=name.substring(8);
                if(!java.util.Arrays.asList("index.html","app.js","horn.wav","icon.png","manifest.webmanifest").contains(name))return missing();
                String mime=name.endsWith(".html")?"text/html":name.endsWith(".js")?"application/javascript":name.endsWith(".wav")?"audio/wav":name.endsWith(".png")?"image/png":"application/manifest+json";
                try{return new WebResourceResponse(mime,"UTF-8",getAssets().open("web/"+name));}catch(IOException e){return missing();}
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return navigate(request.getUrl());}
        });
        frame.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(frame);
        frame.requestApplyInsets();
        web.loadUrl("https://"+HOST+"/assets/index.html");
    }
    private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
    private boolean navigate(Uri uri){
        if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost()))return false;
        if("sms".equals(uri.getScheme())){
            String value=uri.getEncodedSchemeSpecificPart();
            int separator=value.indexOf("&body=");
            String phone=Uri.decode(separator<0?value:value.substring(0,separator));
            String body=separator<0?"":Uri.decode(value.substring(separator+6));
            if(!phone.matches("\\+?[0-9]{7,15}"))return true;
            Intent draft=new Intent(Intent.ACTION_SENDTO,Uri.parse("smsto:"+phone));
            draft.putExtra("sms_body",body);
            try{startActivity(draft);}catch(ActivityNotFoundException e){Toast.makeText(this,"Install or enable a text messaging app to send scores.",Toast.LENGTH_LONG).show();}
        }
        return true;
    }
    @Override public void onBackPressed(){web.evaluateJavascript("(()=>{const d=document.getElementById('edit-dialog');if(d?.open){d.close();return true;}return false;})()",closed->{if(!"true".equals(closed))super.onBackPressed();});}
    @Override protected void onPause(){web.evaluateJavascript("window.dispatchEvent(new Event('pagehide'));",null);web.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
    @Override protected void onDestroy(){if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}

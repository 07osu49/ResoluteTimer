package com.e9.resolutetimer;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;

/** Offline phone timer with a user-exportable standalone Wear OS APK. */
public final class MainActivity extends Activity {
    private static final String HOST="appassets.androidplatform.net";
    private static final int SAVE_WATCH=42;
    private static final int IMPORT_SCHEDULE=43;
    private ValueCallback<Uri[]> fileSelection;
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
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileSelection!=null)fileSelection.onReceiveValue(null);
                fileSelection=callback;
                try{startActivityForResult(params.createIntent(),IMPORT_SCHEDULE);}
                catch(ActivityNotFoundException e){fileSelection.onReceiveValue(null);fileSelection=null;Toast.makeText(MainActivity.this,"Enable a Files app to import a schedule.",Toast.LENGTH_LONG).show();}
                return true;
            }
        });
        web.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if(!"https".equals(uri.getScheme())||!HOST.equals(uri.getHost()))return missing();
                String name=uri.getPath();
                if(name==null||!name.startsWith("/assets/"))return missing();
                name=name.substring(8);
                if(!java.util.Arrays.asList("index.html","app.js","schedule-import.js","IMPORT-LICENSES.txt","horn.wav","icon.png","e9-logo.jpg","manifest.webmanifest","vendor/xlsx.full.min.js","vendor/tesseract.min.js","vendor/worker.min.js","vendor/tesseract-core-lstm.wasm.js","vendor/eng.traineddata","vendor/SHEETJS-LICENSE.txt","vendor/TESSERACT-LICENSE.txt","vendor/TESSERACT-CORE-LICENSE.txt").contains(name))return missing();
                String mime=name.endsWith(".html")?"text/html":name.endsWith(".js")?"application/javascript":name.endsWith(".wav")?"audio/wav":name.endsWith(".png")?"image/png":name.endsWith(".jpg")?"image/jpeg":name.endsWith(".webmanifest")?"application/manifest+json":"application/octet-stream";
                try{return new WebResourceResponse(mime,"UTF-8",getAssets().open("web/"+name));}catch(IOException e){return missing();}
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                if(!request.isForMainFrame())return true;
                return navigate(request.getUrl());
            }
        });
        frame.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(frame);
        frame.requestApplyInsets();
        web.loadUrl("https://"+HOST+"/assets/index.html");
    }
    private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
    private boolean navigate(Uri uri){
        if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost()))return false;
        if("resolute-watch".equals(uri.getScheme())){
            if("save".equals(uri.getHost()))saveWatch();
            else if("help".equals(uri.getHost()))watchHelp();
            return true;
        }
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
    private void saveWatch(){
        Intent picker=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        picker.addCategory(Intent.CATEGORY_OPENABLE);
        picker.setType("application/vnd.android.package-archive");
        picker.putExtra(Intent.EXTRA_TITLE,"ResoluteTimer-Watch-1.0.apk");
        try{startActivityForResult(picker,SAVE_WATCH);}
        catch(ActivityNotFoundException e){Toast.makeText(this,"Enable a Files app to save the watch APK.",Toast.LENGTH_LONG).show();}
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==IMPORT_SCHEDULE){if(fileSelection!=null){fileSelection.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,data));fileSelection=null;}return;}
        if(requestCode!=SAVE_WATCH||resultCode!=RESULT_OK||data==null||data.getData()==null)return;
        Uri destination=data.getData();
        new Thread(()->{
            String result;
            try(InputStream input=getAssets().open("watch/ResoluteTimer-Watch-1.0.apk");
                OutputStream output=getContentResolver().openOutputStream(destination,"wt")){
                if(output==null)throw new IOException("No output stream");
                byte[] buffer=new byte[8192];int count;
                while((count=input.read(buffer))!=-1)output.write(buffer,0,count);
                output.flush();
                result="Watch APK saved. Open Wear Installer 2 on your phone to install it over Wi-Fi.";
            }catch(IOException|SecurityException e){result="Could not save the watch APK. Choose a local Downloads folder and try again.";}
            final String message=result;
            runOnUiThread(()->{if(!isFinishing()&&!isDestroyed())Toast.makeText(this,message,Toast.LENGTH_LONG).show();});
        },"save-watch-apk").start();
    }
    private void watchHelp(){
        new AlertDialog.Builder(this).setTitle("Install on Watch Ultra / Watch7")
            .setMessage("1. Tap Save Watch APK and choose Downloads on this phone.\n\n2. Install Wear Installer 2 by Malcolm Bryant from Google Play on the phone.\n\n3. Connect phone and watch to the same private Wi-Fi. On the watch, enable Developer options by tapping Software version seven times in About watch > Software information.\n\n4. Enable ADB debugging and Wireless debugging. In Wireless debugging, choose Pair new device. Use its pairing IP, port and code in Wear Installer 2. Then use the connection IP and port from the main Wireless debugging screen (a different port).\n\n5. Select ResoluteTimer-Watch-1.0.apk from Downloads in Wear Installer 2 and install. Disable debugging on the watch afterward.\n\nThe watch app is version 1.0: game/penalty timers and field scores. No phone sync, SMS or time slots. Keep it open for alerts. Hardware installation and alerts still need testing.")
            .setPositiveButton("Get Wear Installer 2",(dialog,which)->{
                try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse("https://play.google.com/store/apps/details?id=org.freepoc.wearinstaller2")));}
                catch(ActivityNotFoundException e){Toast.makeText(this,"Open Google Play and search for Wear Installer 2 by Malcolm Bryant.",Toast.LENGTH_LONG).show();}
            }).setNegativeButton("Close",null).show();
    }
    @Override public void onBackPressed(){web.evaluateJavascript("(()=>{const d=document.querySelector('dialog[open]');if(d?.open){d.close();return true;}return false;})()",closed->{if(!"true".equals(closed))super.onBackPressed();});}
    @Override protected void onPause(){web.evaluateJavascript("window.dispatchEvent(new Event('pagehide'));",null);web.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
    @Override protected void onDestroy(){if(fileSelection!=null){fileSelection.onReceiveValue(null);fileSelection=null;}if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}

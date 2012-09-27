package com.programico.smartjs;

import android.os.Bundle;
import android.view.Menu;
import org.apache.cordova.*;
// http://stackoverflow.com/questions/11159280/programmatically-clear-phonegap-cordova-apps-cache-on-android-to-simulate-a-fre
import java.util.Random;


public class SmartJs extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        //http://stackoverflow.com/questions/11159280/programmatically-clear-phonegap-cordova-apps-cache-on-android-to-simulate-a-fre
        Random generator = new Random();
        int z = generator.nextInt();
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html?" + z);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_smart_js, menu);
        return true;
    }
}

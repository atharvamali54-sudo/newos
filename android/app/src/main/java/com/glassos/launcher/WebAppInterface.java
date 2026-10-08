package com.glassos.launcher;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class WebAppInterface {

    private final MainActivity activity;
    private final PackageManager packageManager;
    private final AudioManager audioManager;
    private boolean isTorchOn = false;

    public WebAppInterface(MainActivity activity) {
        this.activity = activity;
        this.packageManager = activity.getPackageManager();
        this.audioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
    }

    @JavascriptInterface
    public String getInstalledApps() {
        JSONArray appsArray = new JSONArray();
        try {
            Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
            mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            List<ResolveInfo> pkgAppsList = packageManager.queryIntentActivities(mainIntent, 0);

            // Sort alphabetically
            Collections.sort(pkgAppsList, new Comparator<ResolveInfo>() {
                @Override
                public int compare(ResolveInfo o1, ResolveInfo o2) {
                    return o1.loadLabel(packageManager).toString().compareToIgnoreCase(o2.loadLabel(packageManager).toString());
                }
            });

            for (ResolveInfo resolveInfo : pkgAppsList) {
                String pkgName = resolveInfo.activityInfo.packageName;
                if (pkgName.equals(activity.getPackageName())) {
                    continue; // Skip self
                }

                JSONObject appObj = new JSONObject();
                appObj.put("name", resolveInfo.loadLabel(packageManager).toString());
                appObj.put("packageName", pkgName);

                try {
                    Drawable icon = resolveInfo.loadIcon(packageManager);
                    appObj.put("icon", drawableToBase64(icon));
                } catch (Exception ignored) {
                    appObj.put("icon", "");
                }

                appsArray.put(appObj);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return appsArray.toString();
    }

    @JavascriptInterface
    public boolean launchApp(String packageName) {
        try {
            Intent launchIntent = packageManager.getLaunchIntentForPackage(packageName);
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(launchIntent);
                return true;
            }
        } catch (Exception e) {
            Toast.makeText(activity, "App cannot be opened: " + packageName, Toast.LENGTH_SHORT).show();
        }
        return false;
    }

    @JavascriptInterface
    public void vibrate(int milliseconds) {
        try {
            Vibrator v = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(milliseconds);
                }
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void setVolume(int percent) {
        try {
            int max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int target = (int) ((percent / 100.0) * max);
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public int getVolume() {
        try {
            int current = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            if (max == 0) return 0;
            return (int) (((double) current / max) * 100);
        } catch (Exception e) {
            return 50;
        }
    }

    @JavascriptInterface
    public void toggleFlashlight() {
        try {
            CameraManager cameraManager = (CameraManager) activity.getSystemService(Context.CAMERA_SERVICE);
            if (cameraManager != null) {
                String cameraId = cameraManager.getCameraIdList()[0];
                isTorchOn = !isTorchOn;
                cameraManager.setTorchMode(cameraId, isTorchOn);
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void openSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void openWifiSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_WIFI_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void openBluetoothSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void openLockscreen() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(activity, LockscreenActivity.class);
                activity.startActivity(intent);
            }
        });
    }

    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }

    private String drawableToBase64(Drawable drawable) {
        try {
            int width = Math.max(1, drawable.getIntrinsicWidth());
            int height = Math.max(1, drawable.getIntrinsicHeight());
            if (width > 96 || height > 96) {
                width = 96;
                height = 96;
            }
            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);

            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 90, stream);
            byte[] bytes = stream.toByteArray();
            return "data:image/png;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP);
        } catch (Exception e) {
            return "";
        }
    }
}

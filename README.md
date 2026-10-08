# 🔮 GlassOS - Frosted Glass Mobile UI Suite (Android)

> **Next-Generation Glassmorphism UI Suite for Android Smartphones**  
> संपूर्ण मोबाईलचा UI काचेसारखा पारदर्शक, ब्लर (Frosted Glass) आणि प्रीमियम बनवणारा ऑल-इन-वन ॲप.

---

## 📸 वैशिष्ट्ये (Key Features)

### १. 🏠 Glass Home Launcher (मुख्य स्क्रीन)
- हुबेहूब रेफरन्स फोटोसारखे दोन मुख्य ग्लास कार्ड्स:
  - **डावे कार्ड (Listen now):** पारदर्शक 3D म्युझिक प्लेअर, अल्बम आर्ट, प्रोग्रेस स्लायडर आणि ग्लोइंग ऑरेंज प्ले बटण.
  - **उजवे कार्ड (Collections & Recommended):** चिल्लआउट, वर्क प्लेलिस्ट चिप्स, गाण्यांची यादी आणि खाली तरंगणारा फ्लोटिंग मिनी प्लेअर.
- रिअल-टाइम 3D ambient टॉरस बॅकग्राउंड आणि हलणारे लाइट ओर्ब्स.

### २. ⚡ Control Center & Quick Toggles (कंट्रोल सेंटर)
- वरून खाली स्वाइप केल्यावर किंवा वरच्या पिलवर टॅप केल्यावर उघडणारा पॅनल.
- वाय-फाय, ब्लूटूथ, मोबाईल डेटा, टॉर्च (फ्लॅशलाइट), एरोप्लेन मोड आणि ऑटो-रोटेट टॉगल्स.
- टच-ड्रॅग करता येणारे व्हर्टिकल **Brightness आणि Volume** स्लायडर्स.

### ३. 📱 Glass App Drawer (ॲप ड्रॉवर)
- खालून वर स्वाइप केल्यावर उघडणारा ॲप ड्रॉवर.
- सर्च बार (Search apps & games...).
- मोबाईलमधील सर्व ॲप्स काचेच्या फ्लोटिंग आयकॉन्ससह दाखवण्याची आणि थेट उघडण्याची सोय.

### ४. 🔊 Floating Glass Volume Panel (व्हॉल्यूम स्लायडर)
- जेव्हा तुम्ही मोबाईलचे आवाज वाढवण्याचे किंवा कमी करण्याचे बटण दाबता, तेव्हा उजव्या बाजूला येणारा सुंदर काचेचा स्लायडर.
- हॅप्टिक व्हायब्रेशन आणि ग्लास क्लिक साउंड इफेक्ट.

### ५. 🔒 Ambient Glass Lock Screen (लॉकस्क्रीन)
- मोठा डिजिटल ग्लास क्लॉक, तारीख आणि बॅटरी.
- लॉकस्क्रीनवरही चालणारे म्युझिक कंट्रोल विजेट.
- **Slide to Unlock** काचेचा ट्रॅक आणि थंब.

---

## 🚀 थेट संगणकावर टेस्ट कसे करायचे? (PC Preview)
तुम्ही तुमच्या कॉम्प्युटरवर लगेच हा UI ओपन करून पाहू शकता:
1. `E:\GlassOS\preview\index.html` ही फाईल **Brave** किंवा **Chrome** ब्राउझरमध्ये उघडा.
2. खालील डॉक बटणांवर क्लिक करून सर्व ५ मोड्स टेस्ट करा:
   - `[ 🏠 Home ]` `[ ⚡ Controls ]` `[ 📱 Apps ]` `[ 🔒 Lock ]` `[ 🔊 Volume ]`
3. गाण्यांवर क्लिक करा, स्लायडर्स ओढा आणि 'Slide to unlock' टेस्ट करा!

---

## 📦 Android APK बिल्ड करणे (Automated GitHub Actions)
या रिपॉझिटरीमध्ये `.github/workflows/build-apk.yml` जोडलेला आहे.
जसा तुम्ही हा कोड GitHub वर पुश कराल:
1. GitHub Actions आपोआप Android SDK आणि Gradle द्वारे **`GlassOS-Launcher.apk`** तयार करेल.
2. GitHub Releases मध्ये थेट तुमच्या फोनवर डाऊनलोड करण्यासाठी APK उपलब्ध होईल!

---

## 🛠️ प्रोजेक्ट रचना (Directory Structure)
```
GlassOS/
├── .github/workflows/
│   └── build-apk.yml          # ऑटोमॅटिक APK बिल्डर (GitHub Actions)
├── android/                   # पूर्ण Android Native Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/glassos/launcher/
│   │   │   │   ├── MainActivity.java        (होम स्क्रीन लाँचर)
│   │   │   │   ├── WebAppInterface.java     (सिस्टम ब्रिड्ज - व्हॉल्यूम, फ्लॅशलाइट, ॲप्स)
│   │   │   │   ├── LockscreenActivity.java  (लॉकस्क्रीन ओव्हरले)
│   │   │   │   ├── VolumeOverlayService.java(सिस्टम व्हॉल्यूम ओव्हरले)
│   │   │   │   └── ControlCenterService.java(कंट्रोल सेंटर जेस्चर)
│   │   │   ├── assets/glass_ui/             (GPU-ॲक्सिलरेटेड ग्लास इंजिन)
│   │   │   │   ├── index.html
│   │   │   │   ├── style.css
│   │   │   │   └── app.js
│   ├── build.gradle
│   └── settings.gradle
├── preview/
│   └── index.html             # PC वर थेट टेस्ट करण्यासाठी
└── README.md
```

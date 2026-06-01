# Android APK (testavimui kol vyksta darbai)

AETERNA Android programėlė — **WebView** apvalkalas, kuris atidaro jūsų **Next.js dev serverį** telefone. Testuokite profilį `/m/ona-demo` be pilno deploy.

## Kas reikia

- [Android Studio](https://developer.android.com/studio) (SDK + JDK 17)
- Kompiuteryje veikiantys `api` ir `web`
- Telefonas ir PC **tame pačiame Wi‑Fi** (arba Android emuliatorius)

## 1. Paleiskite backend ir frontend LAN režimu

**API** (terminalas 1):

```powershell
cd api
npm run dev
```

**Web** — būtina klausyti visų tinklo sąsajų (terminalas 2):

```powershell
cd web
npm run dev:lan
```

`dev:lan` = `next dev -H 0.0.0.0` (prieinama iš telefono).

**API adresas telefonui** — `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://JŪSŲ_PC_IP:4000
```

PC IP (PowerShell): `ipconfig` → IPv4 (pvz. `192.168.1.42`).

## 2. Nustatykite URL prieš build (nebūtina, jei keisite programėlėje)

Redaguokite `android/gradle.properties`:

```properties
WEB_APP_URL=http://192.168.1.42:3000
```

- **Fizinis telefonas:** `http://JŪSŲ_PC_IP:3000`
- **Emuliatorius:** `http://10.0.2.2:3000` (10.0.2.2 = host PC)

## 3. Surinkite APK

### Variantas A — Android Studio (paprasčiausia)

1. Android Studio → **Open** → aplankas `unmute/android`
2. Palaukite Gradle sync
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Variantas B — PowerShell

Jei yra `gradlew.bat`:

```powershell
cd android
.\build-apk.ps1
```

Kopija bus `unmute/AETERNA-install.apk`.

Jei `gradlew` dar nėra, Android Studio atidarius projektą vieną kartą sugeneruos wrapper, arba:

```powershell
cd android
gradle wrapper
.\gradlew.bat assembleDebug
```

## 4. Įdiekite telefone

1. Nukopijuokite `app-debug.apk` į telefoną
2. Įjunkite **Įdiegti iš nežinomų šaltinių** (failų tvarkyklė / Chrome)
3. Atidarykite APK

Programėlė pagal nutylėjimą atidaro **titulinį puslapį** (`/`).

## 6. Automatiniai APK atnaujinimai (OTA)

Kiekvieną kartą surinkus naują APK, telefonai **automatiškai** (arba per meniu **Tikrinti atnaujinimus**) gali atsisiųsti naują versiją iš jūsų API.

1. Paleiskite **API** (`npm run dev` portas **4000**)
2. Surinkite ir publikuokite APK:

```powershell
cd android
.\build-apk.ps1
```

Skriptas:
- padidina `versionCode`
- kopijuoja APK į `api/releases/android/aeterna.apk`
- atnaujina `api/releases/android/update.json`

3. Telefone — programėlė paleidimo metu patikrina ar yra naujesnė versija ir pasiūlo įdiegti.

**Pirmą kartą** vis tiek reikia rankiniu būdu įdiegti APK. Vėlesni atnaujinimai — per programėlę (reikės leisti „Įdiegti nežinomų programų“ AETERNA).

## 5. Pakeisti serverio adresą be naujo build

Programėlėje: meniu **⋮** → **Serverio adresas** → įrašykite pvz. `http://192.168.1.42:3000` → Išsaugoti.

## Troubleshooting

| Problema | Sprendimas |
|----------|------------|
| Balta / klaidos puslapis | Ar `npm run dev:lan` veikia? Naršyklėje telefone atidarykite `http://IP:3000/m/ona-demo` |
| API neveikia | `NEXT_PUBLIC_API_URL` turi būti PC IP, ne `127.0.0.1` |
| Windows Firewall | Leiskite Node.js (portai 3000, 4000) privačiame tinkle |
| Tik HTTP | Dev APK leidžia HTTP; production reikės HTTPS |

## Vėliau (production)

- `next build` + deploy į HTTPS
- APK su fiksuotu `https://…` arba **Capacitor** su įdiegta statika
- Play Store pasirašymas (release keystore)

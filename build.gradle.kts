import org.zaproxy.gradle.AddOnPlugin
import org.zaproxy.gradle.tasks.CreateManifestChanges
import org.zaproxy.gradle.tasks.GenerateI18nJsFile
import org.zaproxy.gradle.tasks.UpdateManifestFile
import org.zaproxy.gradle.tasks.ZapDownloadWeekly
import org.zaproxy.gradle.tasks.ZapInstallAddOn
import org.zaproxy.gradle.tasks.ZapStart
import org.zaproxy.gradle.tasks.ZapShutdown
import org.zaproxy.gradle.tasks.ZapUninstallAddOn

plugins {
    `java-library`
    id("zap-add-on")
    id("com.diffplug.gradle.spotless") version "3.15.0"
}

apply(from = "$rootDir/gradle/compile.gradle.kts")
apply(from = "$rootDir/gradle/travis-ci.gradle.kts")

repositories {
    mavenLocal()
    mavenCentral()
}

status = "alpha"
version = "0.3.0"

val genHudFilesDir = layout.buildDirectory.dir("genHudFiles").get()
val generatedI18nJsFileDir = genHudFilesDir.dir("i18nJs")
val zapHome = layout.buildDirectory.dir("zapHome").get()
val testZapHome = layout.buildDirectory.dir("testZapHome").get()
val zapDownloadDir = layout.buildDirectory.dir("testZapInstall").get()
val zapInstallDir = zapDownloadDir.dir("zap")
val testResultsDir = layout.buildDirectory.dir("reports/tests/test").get()
val zapPort = 8999
// Use a key just to make sure the HUD works with one
val zapApiKey = "password123"
val hudDevArgs = listOf("-config", "hud.enabledForDesktop=true", "-config", "hud.enabledForDaemon=true", "-config", "hud.devMode=true", "-config", "hud.unsafeEval=true")
// Use specific TLS version to not break the tests in Java 11.
val zapCmdlineOpts = listOf("-config", "proxy.securityProtocolsEnabled.protocol=TLSv1.2", "-config", "hud.tutorialPort=9998", "-config", "hud.tutorialTestMode=true", "-config", "hud.showWelcomeScreen=false", "-daemon", "-config", "start.addonDirs=$buildDir/zap/") + hudDevArgs

zapAddOn {
    addOnId.set("hud")
    addOnStatus.set("$status")
    zapHomeFiles.from(generatedI18nJsFileDir)

    zapVersion.set("2.8.0")

    versions {
        downloadUrl.set("https://github.com/zaproxy/zap-hud/releases/download/v$version")
    }
}

val createManifestChanges by tasks.registering(CreateManifestChanges::class) {
    changelog.set(file("CHANGELOG.md"))
    manifestChanges.set(layout.buildDirectory.file("manifest-changes.html"))
}

tasks.named<UpdateManifestFile>("updateManifestFile") {
    baseManifest.set(file("src/other/resources/ZapAddOn.xml"))
    changes.set(createManifestChanges.get().manifestChanges)
    outputDir.set(genHudFilesDir.dir("manifest"))
}

val generateI18nJsFile by tasks.creating(GenerateI18nJsFile::class) {
    bundleName.set("UIMessages")
    srcDir.set(file("src/other/resources/UIMessages/"))
    i18nJsFile.set(file(generatedI18nJsFileDir.file("hud/i18n.js")))
    // In review mode all i18n messages are upper case to easily spot untranslated messages.
    reviewMode.set(false)
}

sourceSets["main"].output.dir(generatedI18nJsFileDir, "builtBy" to generateI18nJsFile)

java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}

val jupiterVersion = "5.3.1"

dependencies {
    zap("org.zaproxy:zap:2.7.0")

    compileOnly(files(fileTree("lib").files))

    testImplementation("org.junit.jupiter:junit-jupiter-api:$jupiterVersion")
    testImplementation("org.junit.jupiter:junit-jupiter-params:$jupiterVersion")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:$jupiterVersion")

    testImplementation("io.github.bonigarcia:selenium-jupiter:2.2.0")
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

fun sourcesWithoutLibs(extension: String) =
        fileTree("src") {
            include("**/*.$extension")
            exclude("**/hud/libraries/**")
        }

spotless {
    java {
        licenseHeaderFile("gradle/spotless/license.java")

        googleJavaFormat().aosp()
    }

    // XXX Don't check for now to not require npm to try the HUD (runZap).
    // format("css", {
    //     target(sourcesWithoutLibs("css"))
    //     prettier().config(mapOf("parser" to "css"))
    // })
}

tasks {
    register<Exec>("npmLintStagedHud") {
        description = "Runs the XO linter on the staged files."

        commandLine("npm", "run", "lint-staged")
    }

    register<Exec>("npmLintAllHud") {
        description = "Runs the XO linter on all files."

        commandLine("npm", "run", "lint")
    }

    register<Exec>("npmTestHud") {
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Runs the ava tests."

        commandLine("npm", "test")
    }

    register<Test>("testTutorial") { 
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Runs the tutorial tests (ZAP must be running)."
        useJUnitPlatform { 
            includeTags("tutorial") 
        } 
    }

    register<Test>("testRemote") { 
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Runs the remote tests (ZAP must be running)."
        useJUnitPlatform { 
            includeTags("remote") 
        } 
    }

    register<ZapDownloadWeekly>("zapDownload") {
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Downloads the latest ZAP weekly release for the unit tests"

        onlyIf { !zapInstallDir.asFile.exists() }

        into.set(zapDownloadDir.asFile)
        zapVersions.set("https://raw.githubusercontent.com/zaproxy/zap-admin/master/ZapVersions.xml")

        doLast {
            copy {
                from(zipTree(fileTree(zapDownloadDir.asFile).matching { "*.zip" }.singleFile)).eachFile {
                    path = path.substring(relativePath.segments[0].length)
                }
                into(zapInstallDir)
                includeEmptyDirs = false
            }
        }
    }

    register<Copy>("copyHudClientFiles") {
        group = AddOnPlugin.ADD_ON_GROUP
        description = "Copies the HUD files to runZap's home directory for use with continuous mode."

        from(file("src/main/zapHomeFiles"))
        from(sourceSets["main"].output.dirs)
        into(zapHome)
    }

    register<ZapStart>("runZap") {
        group = AddOnPlugin.ADD_ON_GROUP
        description = "Runs ZAP (weekly) with the HUD in dev mode."

        dependsOn("zapDownload", "assembleZapAddOn", "copyHudClientFiles")

        installDir.set(zapInstallDir.asFile)
        homeDir.set(zapHome.asFile)

        args.set(listOf("-dev", "-config", "start.checkForUpdates=false", "-config", "start.addonDirs=$buildDir/zap/", "-config", "hud.dir=$zapHome/hud") + hudDevArgs)
    }

    val assembleZapAddOn = tasks.named<Jar>("assembleZapAddOn");
    val uninstallAddOn by registering(ZapUninstallAddOn::class) {
        group = AddOnPlugin.ADD_ON_GROUP
        description = "Uninstalls the add-on from ZAP (started with \"runZap\")."
        addOnId.set(zapAddOn.addOnId)
    }
    assembleZapAddOn.configure { mustRunAfter(uninstallAddOn) }

    register<ZapInstallAddOn>("installAddOn") {
        group = AddOnPlugin.ADD_ON_GROUP
        description = "Installs the add-on into ZAP (started with \"runZap\")."

        dependsOn(uninstallAddOn, assembleZapAddOn)
        addOn.set(assembleZapAddOn.get().archivePath)
    }

    register<ZapStart>("zapStart") {
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Starts ZAP for the unit tests"
        
        dependsOn("zapDownload", "assembleZapAddOn")

        installDir.set(zapInstallDir.asFile)
        homeDir.set(testZapHome.asFile)
        port.set(zapPort)
        apiKey.set(zapApiKey)
        args.set(zapCmdlineOpts)

        doFirst {
            delete(testZapHome)
        }
    }
    
    register<ZapShutdown>("zapStop") {
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Stops ZAP after the unit tests have been run"
        
        port.set(zapPort)
        apiKey.set(zapApiKey)

        shouldRunAfter("test")
    }
    
    tasks.create("zapRunTests") {
        group = LifecycleBasePlugin.VERIFICATION_GROUP
        description = "Starts ZAP, runs the tests and stops ZAP"
        
        dependsOn("zapStart")
        dependsOn("test")
        dependsOn("testTutorial")
        // These are failing too often on travis, presumably due to timeouts?
        // dependsOn("testRemote")
        dependsOn("zapStop")
    }

}

tasks.named<Test>("test") { 
    shouldRunAfter("zapStart")
    useJUnitPlatform { 
        excludeTags("remote", "tutorial") 
    }  
}

tasks.withType(Test::class).configureEach {
    systemProperties.putAll(mapOf(
            "wdm.chromeDriverVersion" to "2.46",
            "wdm.geckoDriverVersion" to "0.24.0",
            "wdm.forceCache" to "true"))
}

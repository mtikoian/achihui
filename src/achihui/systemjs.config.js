/**
 * System configuration for Angular 2 app
 * Reference: https://github.com/angular/quickstart
 */
(function (global) {
    System.config({
        transpiler: 'typescript',
        //typescript compiler options
        typescriptOptions: {
            emitDecoratorMetadata: true
        },
        paths: {
            // paths serve as alias
            'lib:': 'libs/',
            'libjs:': 'libs/js/'
        },
        map: {
            'app': 'app/js', // 'dist',

            // angular bundles
            '@angular/core': 'libjs:@angular/core/bundles/core.umd.js',
            '@angular/common': 'libjs:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'libjs:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'libjs:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'libjs:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'libjs:@angular/http/bundles/http.umd.js',
            '@angular/router': 'libjs:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'libjs:@angular/forms/bundles/forms.umd.js',

            // angular testing umd bundles
            '@angular/core/testing': 'libjs:@angular/core/bundles/core-testing.umd.js',
            '@angular/common/testing': 'libjs:@angular/common/bundles/common-testing.umd.js',
            '@angular/compiler/testing': 'libjs:@angular/compiler/bundles/compiler-testing.umd.js',
            '@angular/platform-browser/testing': 'libjs:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
            '@angular/platform-browser-dynamic/testing': 'libjs:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
            '@angular/http/testing': 'libjs:@angular/http/bundles/http-testing.umd.js',
            '@angular/router/testing': 'libjs:@angular/router/bundles/router-testing.umd.js',
            '@angular/forms/testing': 'libjs:@angular/forms/bundles/forms-testing.umd.js',

            // other libraries
            'rxjs': 'libjs:rxjs',
            'angular2-in-memory-web-api': 'libjs:angular2-in-memory-web-api',
            'moment': 'libjs:moment/min/moment.min.js',
            'primeng': 'lib:primeng',
            'ng2-translate': 'libjs:ng2-translate',
            'oidc-client': 'libjs:oidc-client/dist/oidc-client.min.js',
            'typescript': 'libjs:typescript/lib/typescript.js'
        },
        packages: {
            'app': {
                main: './main.js',
                format: 'register',
                defaultExtension: 'js'
            },
            'rxjs': {
                defaultExtension: 'js'
            },
            'primeng': {
                defaultExtension: 'js'
            },
            'ng2-translate': {
                defaultExtension: 'js'
            },
            'angular2-in-memory-web-api': {
                defaultExtension: 'js'
            }
        }
    });
})(this);

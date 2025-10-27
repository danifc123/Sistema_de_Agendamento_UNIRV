// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: ['ChromeHeadless'],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    restartOnFileChange: true,
    singleRun: false,
    // Configurações para execução em CI/CD
    customLaunchers: {
      ChromeHeadlessCI: {  // ← Volte para Chrome
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-web-security']
      }
    }
  });
};

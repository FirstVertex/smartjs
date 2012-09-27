({
    baseUrl: "../../client/app",
    out: "web/main.min.js",
    name: "main",
    // don't allow a real phonegap on web builds
    stubModules: ['phonegap'],
    // important for finding dynamically added scripts
    findNestedDependencies: true,
    uglify: {
        // important for binding to knockout in the html, the public api must remain visible
        toplevel: false,
        max_line_length: 600
    },
    mainConfigFile: '../../client/app/main.js'
})
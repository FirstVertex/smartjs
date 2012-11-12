({
    baseUrl: "../../client/app",
    out: "android/assets/www/app/main.js",
    name: "main",
    include: ['member/newMemberPageViewModel', 'topic/topicListPageViewModel', 'chat/chatRoomViewModel'],
    // important for finding dynamically added scripts
    findNestedDependencies: true,
    uglify: {
        // important for binding to knockout in the html, the public api must remain visible
        toplevel: false,
        max_line_length: 600,
        defines: {
            BuildConfig: ['name', 'android'],
            BuildEnv: ['name', 'prod']
        }
    },
    mainConfigFile: '../../client/app/main.js'
})
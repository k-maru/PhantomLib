module.exports = function (grunt) {

    var fs = require("fs"),
        def = {
            builddir: "build",
            srcfiles: "src/**/*.ts"
        },
        uglifyFiles = (function(){
            return grunt.file.expand(def.builddir + "/*.js").reduce(function(prev, src){
                if(src.substr(src.length - 7) === ".min.js") return prev;
                prev[src.substr(0, src.length - 3) + ".min.js"] = src;
                return prev;
            }, {});
        })();

    grunt.initConfig({
        def: def,
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            main: {
                files: uglifyFiles
            }
        },
        watch: {
            main: {
                files: "<%= def.srcfiles %>",
                tasks: ["build"]
            }
        },
        typescript: {
            main: {
                files: {
                    "<%= def.builddir %>": "<%= def.srcfiles %>"
                },
                options: {
                    comments: true,
                    base_path: "src",
                    declaration: false,
                    module: "commonjs",
                    target: "ES5"
                }
            }
        },
        clean:{
            main:"<%= def.builddir %>/**/*.*"
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.registerTask("build", ["clean:main", "typescript:main", "uglify:main"]);
    grunt.registerTask('default', ["build"]);
};

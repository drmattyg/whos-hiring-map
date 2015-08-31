module.exports = function(grunt) {
	grunt.initConfig({
		typescript: {
		    base: {
		      src: ['./*.ts'],
		      dest: './build',
		      options: {
		        module: 'commonjs', //or commonjs 
		        target: 'es5', //or es3 
		        sourceMap: true,
		        declaration: true
		      }
		    }
		  },
		  execute: {
		  	target: {
		  		src: ['build/parser.js']
		  	}
		  }
	});
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-execute');
	grunt.registerTask('default', ['typescript', 'execute']);
};


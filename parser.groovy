@Grapes(
	@Grab(group='org.codehaus.groovy.modules.http-builder', module='http-builder', version='0.7.1')
)
import groovyx.net.http.HTTPBuilder
import groovyx.net.http.ContentType

def http = new HTTPBuilder('https://news.ycombinator.com/item?id=9996333')
http.ignoreSSLIssues()
def html = http.get(contentType: ContentType.HTML)
println html.getClass()

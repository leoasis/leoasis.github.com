require "rubygems"
require "tmpdir"

require "bundler/setup"

GITHUB_REPONAME = "leoasis/leoasis.github.com"

desc "Generate blog files"
task :generate do
  system "JEKYLL_ENV=production jekyll build"
end


desc "Generate and publish blog to gh-pages"
task :publish => [:generate] do
  Dir.mktmpdir do |tmp|
    cp_r "_site/.", tmp

    pwd = Dir.pwd
    Dir.chdir tmp

    system "git init"
    system "git add ."
    message = "Site updated at #{Time.now.utc}"
    system "git commit -m #{message.inspect}"
    system "git remote add origin git@github.com:#{GITHUB_REPONAME}.git"
    system "git push origin master --force"

    Dir.chdir pwd
  end
end
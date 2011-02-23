namespace :coffee do
  desc "Compile coffee-script files into javascript (starts a watcher daemon)"
  task :compiler do
    sh "coffee -c -o js -w src"
  end
end

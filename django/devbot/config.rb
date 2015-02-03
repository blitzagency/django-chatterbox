# Require any additional compass plugins here.

require 'compass/import-once/activate'
require 'susy'
require 'breakpoint'

# Set this to the root of your project when deployed:

http_path = ENV['STATIC_URL'] || '/static/'

css_dir = "css"
sass_dir = "scss"
images_dir = "img"
javascripts_dir = "js"
relative_assets = false

module Sass::Script::Functions
    def env_or_default(env_name, default)
        Sass::Script::String.new(ENV[env_name.value] || default.value)
    end
    declare :env_or_default, :args => [:string, :string]
end

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
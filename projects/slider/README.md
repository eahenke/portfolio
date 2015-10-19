# Slider

## About
This code provides a user controllable image slider.  The slider moves automatically, but users may select the previous slide, the next slide, or use the dot icons to choose a specific slide.

## Usage

### HTML

```html
<div class="slider-wrapper">
		<!-- Slider -->
		<ul class="slider">
			<li class="slide active"><img src=YOUR_IMAGE /></li>
			<li class="slide"><img src=YOUR_IMAGE /></li>
		</ul>

		<!--Controls-->
		<div class="arrow arrow-left">
			<span class="icon-left-open"></span>
		</div>

		<div class="arrow arrow-right">
			<span class="icon-right-open"></span>
		</div>		
	</div>
```

You may give any slide a class of `active`, and the slider will start with that slide.  If no slide is set as `active`, the first slide will be assigned that class.


### Setting the size
The `slider-wrapper` class should have a fixed height and width, the same size as the images in the slider.
####Using Sass
In `sass/_variables.scss`, set `$slide-width` and `$slide-height` to your images' dimensions.
####Using CSS
In `css/slider.css` give `.slider-wrapper` a width and height that correspond to your image. 

## Control
The code

```html
<div class="arrow arrow-left">
	<span class="icon-left-open"></span>
</div>
```
and

```html
<div class="arrow arrow-right">
	<span class="icon-right-open"></span>
</div>
```
create clickable arrow icons that let you skip to the next or previous slide.  The slider will also automatically create a number of dot controls that match the number of slides.  Click the dots to skip to the corresponding slide, in the order they are set in the code.

## Dependencies
Requires jQuery

## Demo
Demo hosted at [eahenke.github.io/slider](http://eahenke.github.io/slider)
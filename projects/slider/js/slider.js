(function() {
	"use strict";

	$(document).ready(function() {
		
		//create new Slider object for each '.slider-wrapper' found, and initialize.
		//sliders as objects allows for multiple indepedent sliders on the same page.
		//to style differently (size, margins, etc), add specific classes in SCSS file.
		$('.slider-wrapper').each(function() {			
			var slider = new Slider($(this));
			slider.assignSlideClasses();
			slider.activateControls();		
			slider.beginSlider();
		});
	});


	//Slider object, holds info on slider specific node, timer, and controls
	function Slider(node) {
		this.context = node;
		this.timerId;

		this.arrowRight = this.context.find('.arrow-right');
		this.arrowLeft = this.context.find('.arrow-left');

		//Initial set up

		//If no height set, give height based on image descendent		
		if(!this.context.height()) {
			var height = this.context.find('img').first().height();		
			this.context.height(height);
		}
		
		//If no slide set as active, set the first as active
		if(!this.context.find('.slide.active').length) {
			this.context.find('.slide').first().addClass('active');
		}

		//Create the correct number of dot controls
		var slideNum = this.context.find('.slide').length;
		var dots = [];
		var dotWrapper = $('<div>').addClass('dot-wrapper').appendTo(this.context);
		for(var i = 0; i < slideNum; i++) {
			dots.push('<div class="dot"></div>');
		}
		dots = dots.join('');
		dotWrapper.append(dots);
		
		//Dots must be set up first
		this.dots = this.context.find('.dot');

		//Initial set up

		//If no slide set as active, set the first as active
		if(!this.context.find('.slide.active').length) {
			this.context.find('.slide').first().addClass('active');
		}

		//Create the correct number of dot controls
		var slideNum = this.context.find('.slide').length;
		var dots = [];
		var dotWrapper = $('<div>').addClass('dot-wrapper').appendTo(this.context);
		for(var i = 0; i < slideNum; i++) {
			dots.push('<div class="dot"></div>');
		}
		dots = dots.join('');
		dotWrapper.append(dots);
	}
	window.Slider = Slider;

	Slider.prototype = {
		constructor: Slider
	};
			
	//Starts the slider timer
	Slider.prototype.beginSlider = function() {
		var self = this;
		self.timerId = setTimeout(function() {
		self.nextSlide(true);
		}, 5000);		
	}	

	//Moves slides and restarts the slider timer.
	//if passed true, slides forwards, if false, slides backwards
	Slider.prototype.nextSlide = function(forward, context) {
		var self = this;

		clearTimeout(this.timerId); //reset Slider timer;

		this.deactivateControls();

		var leftOrRight;
		var slidesToMove;
		var slideWidth = $('.slide', context).width();

		if(forward) {
			leftOrRight = "-=";
			slidesToMove = '.slide.active, .slide.right';
		} else {
			leftOrRight = "+=";
			slidesToMove = '.slide.active, .slide.left';
		}

		self.context.find(slidesToMove).animate({
				left: leftOrRight + slideWidth,
			}, 1000
			).promise().done(function(){
				self.queueSlides(forward);
				self.assignSlideClasses();
				self.activateControls();
				self.beginSlider();
			});					
	}

	//Sets up classes for current slide, next and previous slides
	Slider.prototype.assignSlideClasses = function() {
		var current = this.context.find('.slide.active');
		var prev;
		var next;

		//assign next slide
		if(!current.next().length) {
			next = current.siblings().first();
		} else {
			next = current.next();
		}
		
		//assign prev slide
		if(!current.prev().length) {
			prev = current.siblings().last();
		} else {
			prev = current.prev();
		}

		prev.addClass('left');
		next.addClass('right');		
		this.dotMatch(current);
	}

	//After movement, based on direction, determines new active slide and removes old classes 
	Slider.prototype.queueSlides = function(forward) {
		
		//must come before assigning the new active slide or both slides are stripped.
		this.context.find('.slide.active').removeClass('active');

		if(forward) {
			this.context.find('.slide.right').removeClass('right').addClass('active');
		} else {
			this.context.find('.slide.left').removeClass('left').addClass('active');
		}

		//strip left and right classes from all slides, leave only active
		this.context.find('.slide').removeClass('right left').removeAttr('style');
	}

	//Matches up the dot with the current slide.
	Slider.prototype.dotMatch = function(currentSlide) {
		var index = currentSlide.index();
		this.context.find('.dot').removeClass('active');
		this.context.find('.dot').eq(index).addClass('active');	

	}

	//Based on which dot is clicked, sets up the corresponding slide (based on index) to be the next slide.
	Slider.prototype.goToSlide = function(dot) {
		var dotIndex = dot.index();
		var currentIndex = dot.parent().find('.active').index();

		console.log('clicked ' + dotIndex);
		console.log('current ' + currentIndex);

		//disallows current dot from being selected
		if(dotIndex != currentIndex) {
			dot.parents('.slider-wrapper').find('.slide').removeClass('left right');

			var forward, directionClass;

			if(currentIndex < dotIndex) {
				directionClass = 'right';
				forward = true;
			} else {
				directionClass = 'left';
				forward = false;
			}

			dot.parents('.slider-wrapper').find('.slide').eq(dotIndex).addClass(directionClass);
			this.nextSlide(forward);
		}
	}

	//Turns on Slider controls.  Should be turned on initially, and after animation has completed.
	Slider.prototype.activateControls = function() {
		var self = this;
		

		$('.arrow').mousedown(function() {
			$(this).find('span').addClass('clicked');
		});

		$('.arrow').mouseup(function() {
			$(this).find('span').removeClass('clicked');
		});

		self.arrowRight.click(function(){
			self.nextSlide(true);
		});

		self.arrowLeft.click(function() {			
			self.nextSlide(false);
		});

		self.dots.click(function() {
			self.goToSlide($(this));			
		});
			
	}

	//Turns off Slider controls.  Should be called during animation to prevent click spamming.
	Slider.prototype.deactivateControls = function() {
		this.context.find('.dot').off();
		this.context.find('.arrow').off();
			
	}	
		
})();
var Project = function(project) {
	var self = this;
	self.title = ko.observable(project.title);
	self.description = ko.observable(project.description);
	self.tools = ko.observableArray(project.tools);
	self.link = ko.pureComputed(function() {
		if(project.link.length) {
			return project.link;
		} else {
			return false;
		}
	});

	self.codeLink = ko.pureComputed(function() {
		if(project.codeLink.length) {
			return project.codeLink;
		} else {
			return false;
		}
	});

	self.imagePath = ko.observable(project.imagePath);
	
	self.icon = ko.pureComputed(function() {
		var iconType = project.codeLinkIcon;
		if(iconType == 'github') {
			return 'icon-github';
		} else if(iconType == 'codepen') {
			return 'icon-codepen';
		} else {
			return '';
		}
	});
}

var ViewModel = function() {
	var self = this;

	self.projectList = ko.observableArray([]);

	self.navLinks = ko.observableArray([
		{
			name: 'Projects',
			href: '#projects'

		},
		{
			name: 'About',
			href: '#about'
		},
		{
			name: 'Contact',
			href: '#contact'
		}
	]);

	self.socialLinks = ko.observableArray([
		{
			name: 'Github',
			href: 'http://github.com/eahenke',
			icon: 'icon-github',

		},

		{
			name: 'Codepen',
			href: 'http://codepen.io/eahenke',
			icon: 'icon-codepen',

		}
	]);

	//Scrolls to a section based on a link's href.  If the clicked element is not a link,
	//it looks for the href of the first <a> child element.
	self.scrollTo = function(el, event) {
		event.preventDefault();
		var element = $(event.target);
		var destination;

		if(element[0].tagName != 'A') {
			destination = element.find('a').first().attr('href');			
		} else {			
			destination = element.attr('href');
			
		}
		$('.html, body').animate({
			scrollTop: $(destination).offset().top
		}, 1000);
	}

	function init() {
		var temp = [];
		projects.forEach(function(project) {
			temp.push(new Project(project));
		});
		self.projectList(temp);
	}

	init();
}

ko.applyBindings(new ViewModel());
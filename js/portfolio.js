var Project = function(project) {
	var self = this;
	self.title = ko.observable(project.title);
	self.description = ko.observable(project.description);
	self.tools = ko.observableArray(project.tools);
	self.link = ko.observable(project.link);
	self.github = ko.observable(project.github);
	self.imagePath = ko.observable(project.imagePath);
}

var ViewModel = function() {
	var self = this;

	self.projectList = ko.observableArray([]);

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
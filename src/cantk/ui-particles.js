/*
 * File:   ui-particles.js
 * Author: Li XianJing <xianjimli@hotmail.com>
 * Brief:  particles 
 * 
 * Copyright (c) 2014 - 2015  Li XianJing <xianjimli@hotmail.com>
 * 
 */

function UIParticles() {
	return;
}

var UIElement = CanTK.UIElement;
UIParticles.prototype = new UIElement();
UIParticles.prototype.isUIParticles = true;

UIParticles.prototype.initUIParticles = function(type) {
	this.initUIElement(type);	
	this.name = "ui-particles";
	this.setDefSize(200, 200);
	this.setTextType(Shape.TEXT_NONE);
	this.setImage(UIElement.IMAGE_DEFAULT, null);
	this.images.display = UIElement.IMAGE_DISPLAY_CENTER;

	return this;
}

UIParticles.prototype.setEmitterPosition = function(x, y) {
	if(this.emitter) {
		this.emitter.p.x = x;
		this.emitter.p.y = y;
	}
	else {
		this.emitterX = 0;
		this.emitterY = 0;
	}

	return this;
}

UIParticles.prototype.onInit = function() {
	this.initParticles();
	this.start();

	return;
}
	
UIParticles.prototype.initParticles = function() {
	var x = this.w >> 1;
	var y = this.h >> 1;
	var proton = new Proton();
	var emitter = new Proton.Emitter();

	emitter.rate = new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(.1, .25));
	emitter.addInitialize(new Proton.Mass(1));
	emitter.addInitialize(new Proton.Radius(1, 3));
	emitter.addInitialize(new Proton.Life(1, 4));
	emitter.addInitialize(new Proton.Velocity(new Proton.Span(2, 4), new Proton.Span(-30, 30), 'polar'));
	emitter.addBehaviour(new Proton.RandomDrift(30, 30, .05));
	emitter.addBehaviour(new Proton.Color('ff0000', 'random', Infinity, Proton.easeOutQuart));
	emitter.addBehaviour(new Proton.Scale(1, 0.7));
	emitter.p.x = x;
	emitter.p.y = y;
	emitter.emit();
	proton.addEmitter(emitter);

	this.emitter = emitter;
	this.lastUpdateTime = Date.now();

}

UIParticles.prototype.start = function() {
	var me = this;
	function update() {
		if(!me.parentShape || !me.emitter) {
			clearInterval(me.timerID);
			me.timerID = 0;
			return;
		}

		if(me.isVisible()) {
			var now = Date.now();
			var	elapsed = (now - me.lastUpdateTime)/1000;
			me.emitter.update(elapsed);
			me.lastUpdateTime = now;
		}
	}

	me.timerID = setInterval(update, 25);
}

UIParticles.prototype.drawParticle = function(canvas, particle) {
	if (particle.target) {
		if (particle.target instanceof Image) {
			var w = particle.target.width * particle.scale | 0;
			var h = particle.target.height * particle.scale | 0;
			var x = particle.p.x - w / 2;
			var y = particle.p.y - h / 2;

			if (!!particle.color) {
				if (!particle.transform["buffer"])
					particle.transform.buffer = this.getBuffer(particle.target);
				var bufferContext = particle.transform.buffer.getContext('2d');
				bufferContext.clearRect(0, 0, particle.transform.buffer.width, particle.transform.buffer.height);
				bufferContext.globalAlpha = particle.alpha;
				bufferContext.drawImage(particle.target, 0, 0);
				bufferContext.globalCompositeOperation = "source-atop";
				bufferContext.fillStyle = Proton.Util.rgbToHex(particle.transform.rgb);
				bufferContext.fillRect(0, 0, particle.transform.buffer.width, particle.transform.buffer.height);
				bufferContext.globalCompositeOperation = "source-over";
				bufferContext.globalAlpha = 1;
				canvas.drawImage(particle.transform.buffer, 0, 0, particle.transform.buffer.width, particle.transform.buffer.height, x, y, w, h);
			} else {
				canvas.save();
				canvas.globalAlpha = particle.alpha;
				canvas.translate(particle.p.x, particle.p.y);
				canvas.rotate(Proton.MathUtils.degreeTransform(particle.rotation));
				canvas.translate(-particle.p.x, -particle.p.y);
				canvas.drawImage(particle.target, 0, 0, particle.target.width, particle.target.height, x, y, w, h);
				canvas.globalAlpha = 1;
				canvas.restore();
			}
		}
	} else {
		if (particle.transform["rgb"])
			canvas.fillStyle = 'rgba(' + particle.transform.rgb.r + ',' + particle.transform.rgb.g + ',' + particle.transform.rgb.b + ',' + particle.alpha + ')';
		else
			canvas.fillStyle = particle.color;
		canvas.beginPath();
		canvas.arc(particle.p.x, particle.p.y, particle.radius, 0, Math.PI * 2, true);
		if (this.stroke) {
			canvas.strokeStyle = this.stroke.color;
			canvas.lineWidth = this.stroke.thinkness;
			canvas.stroke();
		}

		canvas.closePath();
		canvas.fill();
	}
}

UIParticles.prototype.paintSelfOnly = function(canvas) {
	if(!this.emitter) {
		return;
	}

	var particles = this.emitter.particles;
	for(var i = 0; i < particles.length; i++) {
		var iter = particles[i];
		this.drawParticle(canvas, iter);
	}

	this.postRedraw();

	return;
}

UIParticles.prototype.shapeCanBeChild = function(shape) {
	return false;
}

function UIParticlesCreator(type, w, h, defaultImage) {
	var args = [type, "ui-particles", null, 1];
	
	CanTK.ShapeCreator.apply(this, args);
	this.createShape = function(createReason) {
		var g = new UIParticles();
		return g.initUIParticles(this.type);
	}
	
	return;
}
	
CanTK.regShapeCreator(new UIParticlesCreator(), "");
setTimeout(function() {
	CanTK.regShapeCreator(new UIParticlesCreator(), "Scene Elements");
}, 2000);

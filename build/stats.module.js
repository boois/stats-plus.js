/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function (scene,renderer) {
	this.scene = scene;
	this.renderer = renderer;
	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );
	var infos = document.createElement('div');
	infos.style.cssText = 'min-width:150px;display:flex;flex-direction:column;background:#111;border:1px solid #222;color:#fff;font-size:12px;padding:4px;';
	var domHtml = "<div>FPS: <span id='-stats-i-0' style='color: #ff6600;'></span></div><div>RAM: <span id='-stats-i-1'></span></div>";
	if(this.scene){
		domHtml += "<div>vertices: <span id='-stats-i-2'></span></div><div>objects: <span id='-stats-i-5'></span></div><div>faces: <span id='-stats-i-4'></span></div>";
	}
	if(this.renderer){
		domHtml += "<div>drawcalls: <span id='-stats-i-3'></span></div>";
	}
	infos.innerHTML = domHtml;
	container.appendChild(infos);

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {
		for ( var i = 0; i < container.children.length; i ++ ) {
			container.children[ i ].style.display = i === id ? 'block' : 'none';
		}
		mode = id;
	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}
	showPanel( 0 );
	var that = this;
	var result= {

		REVISION: 16,
		frames: 0,
		dom: container,
		memory: 0,
		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;
			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time >= prevTime + 1000 ) {
				
				result.frames = ( frames * 1000 ) / ( time - prevTime );
				fpsPanel.update( result.frames, 100 );
				prevTime = time;
				frames = 0;
				var memory = performance.memory;
				var value = memory.usedJSHeapSize / 1048576;
				var value1 = memory.jsHeapSizeLimit / 1048576;
				if ( memPanel ) {
					memPanel.update( value,value1  );
				}
				result.memory = value;
				result.memoryLimit = value1;

				document.getElementById( '-stats-i-0' ).innerHTML = result.frames.toFixed(0);
				document.getElementById( '-stats-i-1' ).innerHTML = "<span style='color: #ff6600;'>"+result.memory.toFixed(2)+"Mb</span> ("+(result.memory/result.memoryLimit*100).toFixed(2)+"%)</span>";
				
				if(that.scene && that.scene.children){
					var vertexCount = that.scene.children.reduce(function(count, child){
						if (child.geometry) {
							return count + (child.geometry.attributes.position.count || 0);
						}
						return count;
					}, 0);
					var triangleCount = that.scene.children.reduce(function(count, child) {
						if (child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
							return count + (child.geometry.attributes.position.count / 3); // 每个三角形由3个顶点组成
						}
						return count;
					}, 0);
					var countAllObjects = function(scene) {
						var count = 0;
						scene.traverse(function (child) {
							count++;
						});
						return count;
					};
					var totalObjectCount = countAllObjects(that.scene);
					document.getElementById('-stats-i-5').innerHTML = "<span style='color: #ff6600;'>"+totalObjectCount.toFixed(0)+"</span>";
					document.getElementById('-stats-i-2').innerHTML = "<span style='color: #ff6600;'>"+vertexCount.toFixed(0)+"</span>";
					document.getElementById('-stats-i-4').innerHTML = "<span style='color: #ff6600;'>"+triangleCount.toFixed(0)+"</span>";
				}
				if(that.renderer){
					document.getElementById( '-stats-i-3' ).innerHTML = "<span style='color: #ff6600;'>"+that.renderer.info.render.calls+"</span>";
				}
			}
			return time;
		},

		update: function () {
			beginTime = this.end();
		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};
	
	return result;

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, HEIGHT = 48 * PR,
			TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
			GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
			GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	context.fillText( name, TEXT_X, TEXT_Y );
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,

		update: function ( value, maxValue ) {

			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

		}

	};

};

export default Stats;

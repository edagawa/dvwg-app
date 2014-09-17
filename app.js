;(function() {
  var nativeApp = {
    init: function() {
      this.drawTimeLine();
    },

    //群れの作成
    drawSwarm: function(svgNum) {
      //Detector.jsでWebGLに対応していないユーザーのために処理をする
      if (!Detector.webgl)Detector.addGetWebGLMessage();

      //変数の設定
      var container;
      var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color;
      var mouseX = 0, mouseY = 0;

      //ウィンドウサイズを1/2で取得
      var windowHalfX = window.innerWidth / 2;
      var windowHalfY = window.innerHeight / 2;

      //three.jsを描画する要素
      var threeView = document.getElementById('three-view');
      var timelineAttribute = parseInt(svgNum) * 2000;
      init(timelineAttribute);
      animate();

      function init(timelineAttribute) {
        //three.jsを描画する要素を生成
        if(threeView !== null) {
          document.getElementById("three-view").remove();
        }

        container = document.createElement('div');
        container.setAttribute('id', 'three-view');
        document.body.appendChild( container );

        //THREE.PerspectiveCamera
        //透視投影カメラ。近くのモノは大きく・遠くのモノは小さく、遠近法的に映る。
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
        camera.position.z = 1000;

        //THREE.Scene
        //オブジェクト、ライトやカメラを置く場所
        scene = new THREE.Scene();

        //THREE.FogExp2
        //距離に応じて指数関数的に密度の高い成長、指数フォグを定義するパラメータ
        scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

        //THREE.Geometry
        //幾何学。
        geometry = new THREE.Geometry();

        //ここで描画の調整できる
        for ( var i = 0, max = timelineAttribute; i < timelineAttribute; i ++ ) {

          //THREE.Vector3
          //3D vector.
          var vertex = new THREE.Vector3();
          vertex.x = Math.random() * 2000 - 1200;
          vertex.y = Math.random() * 2000 - 1200;
          vertex.z = Math.random() * 2000 - 1200;
          geometry.vertices.push( vertex );

        }

        parameters = [
          [ [1, 1, 0.5], 5 ],
          [ [0.95, 1, 0.5], 4 ],
          [ [0.90, 1, 0.5], 3 ],
          [ [0.85, 1, 0.5], 2 ],
          [ [0.80, 1, 0.5], 1 ]
        ];

        for ( var i = 0, max = parameters.length; i < max; i ++ ) {

          color = parameters[i][0];
          size  = parameters[i][1];

          //THREE.PointCloudMaterial
          //particleシステムで使われるデフォルトの素材
          materials[i] = new THREE.PointCloudMaterial( { size: size } );

          //THREE.PointCloud
          //可変サイズの点の形で粒子を表示するためのクラス
          particles = new THREE.PointCloud( geometry, materials[i] );

          particles.rotation.x = Math.random() * 6;
          particles.rotation.y = Math.random() * 6;
          particles.rotation.z = Math.random() * 6;

          scene.add( particles );

        }

        //THREE.WebGLRenderer
        //WebGLを使用して、美しく細工されたシーンを表示
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        container.appendChild( renderer.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function onDocumentMouseMove( event ) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

      }

      function onDocumentTouchStart( event ) {

        if ( event.touches.length === 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

      }

      function onDocumentTouchMove( event ) {

        if ( event.touches.length === 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

      }

      //

      function animate() {
        requestAnimationFrame( animate );

        render();
      }

      function render() {
        var time = Date.now() * 0.00005;

        camera.position.x += ( mouseX - camera.position.x ) * 0.05;
        camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

        camera.lookAt( scene.position );

        for ( var i = 0, max = scene.children.length; i < max; i ++ ) {

          var object = scene.children[ i ];

          if ( object instanceof THREE.PointCloud ) {

            object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

          }

        }

        for ( var i = 0, max = materials.length; i < max; i ++ ) {

          color = parameters[i][0];

          h = ( 360 * ( color[0] + time ) % 360 ) / 360;
          materials[i].color.setHSL( h, color[1], color[2] );

        }

        renderer.render( scene, camera );

      }
    },

    //タイムラインの作成
    drawTimeLine: function() {
      var margin = {top: 20, right: 50, bottom: 30, left: 50},
          width = 670 - margin.left - margin.right,
          height = 195 - margin.top - margin.bottom;

      var parseDate = d3.time.format("%d-%b-%y").parse,
          bisectDate = d3.bisector(function(d) { return d.date; }).left,
          formatValue = d3.format(",.2f"),
          formatCurrency = function(d) { return formatValue(d); };

      var x = d3.time.scale()
          .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

      var line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.total); });

      var svg = d3.select("#timeline").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id", "svg-wrap")
          .attr("data-num", "")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      d3.csv("data/candy07.csv", function(error, data) {
        data.forEach(function(d) {
          d.date = parseDate(d.date);
          d.total = +d.total;
        });

        data.sort(function(a, b) {
          return a.date - b.date;
        });

        x.domain([data[0].date, data[data.length - 1].date]);
        y.domain(d3.extent(data, function(d) { return d.total; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Appli DAU");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove)
            .on("click", renderView);

        function mousemove() {
          var x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i],
              d = x0 - d0.date > d1.date - x0 ? d1 : d0,
              swarmLen = d.total / 10;
          focus.attr("transform", "translate(" + x(d.date) + "," + y(d.total) + ")");
          focus.select("text").text(formatCurrency(d.total)).attr("id", 'data--num').attr("data-num", formatCurrency(d.total));

          //svg要素に値をセット
          var svgElement = document.getElementById('svg-wrap');
          svgElement.dataset.num = d.close;
        }

        function renderView() {
          var svgElement = document.getElementById('data--num');
          var svgNum = svgElement.getAttribute('data-num');
          nativeApp.drawSwarm(svgNum);
        }
      });
    }
  }
  nativeApp.init();
})();

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ animation_data.animation_title }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .scene {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            width: 900px;
            height: 600px;
            margin-left: auto;
            margin-right: auto;
            display: flex;
            flex-direction: column;
        }
        
        .scene h2 {
            color: #ffeb3b;
            margin-bottom: 15px;
            font-size: 1.5em;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .scene-content {
            flex: 1;
            display: grid;
            gap: 20px;
            height: 400px;
        }
        
        /* 布局类型样式 */
        .layout-single .scene-content {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
        }
        
        .layout-dual .scene-content {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
        }
        
        .layout-triple .scene-content {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr;
        }
        
        .layout-vertical .scene-content {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
        }
        
        .layout-mixed .scene-content {
            grid-template-columns: 2fr 1fr;
            grid-template-rows: 2fr 1fr;
        }
        
        .content-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
            padding: 10px;
        }
        
        .content-area h3 {
            color: #ffeb3b;
            margin: 0 0 10px 0;
            font-size: 1.1em;
        }
        
        .content-area svg {
            max-width: 100%;
            max-height: 100%;
        }
        
        .explanation {
            background: rgba(0,0,0,0.2);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #ffeb3b;
            height: 80px;
            display: flex;
            align-items: center;
            margin-top: auto;
        }
        
        .controls {
            text-align: center;
            margin: 30px 0;
        }
        
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            margin: 5px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        button:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .current-scene {
            border: 2px solid #ffeb3b;
            box-shadow: 0 0 20px rgba(255,235,59,0.3);
        }
        
        .script-panel {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
            display: none;
        }
        
        .script-panel.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{ animation_data.animation_title }}</h1>
        
        <div class="controls">
            {% for scene in animation_data.scenes %}
            <button onclick="showScene('{{ scene.scene_id }}')">{{ loop.index }}. {{ scene.title }}</button>
            {% endfor %}
            <button onclick="toggleScripts()">显示/隐藏脚本</button>
            <button onclick="playAll()">播放全部</button>
        </div>

        {% for scene in animation_data.scenes %}
        <div id="{{ scene.scene_id }}" class="scene layout-{{ scene.layout.type }}">
            <h2>{{ scene.title }}</h2>
            <div class="scene-content">
                {% for area in scene.content_areas %}
                <div class="content-area" style="grid-area: {{ area.grid_position }};">
                    {% if area.title %}
                    <h3>{{ area.title }}</h3>
                    {% endif %}
                    
                    {% if area.content_type == 'svg' %}
                        {{ area.content | safe }}
                    {% elif area.content_type == 'html' %}
                        {{ area.content | safe }}
                    {% else %}
                        <p>{{ area.content }}</p>
                    {% endif %}
                    
                    {% if area.caption %}
                    <small style="color: #ccc; margin-top: 10px;">{{ area.caption }}</small>
                    {% endif %}
                </div>
                {% endfor %}
            </div>
            <div class="explanation">
                <strong>{{ scene.explanation }}</strong>
            </div>
            
            <div class="script-panel" id="script-{{ scene.scene_id }}">
                <strong>视频脚本：</strong> {{ scene.script }}
            </div>
        </div>
        {% endfor %}
    </div>

    <script>
        let currentScene = 1;
        let autoPlay = false;
        let scriptsVisible = false;

        function showScene(sceneId) {
            // 隐藏所有场景
            document.querySelectorAll('.scene').forEach(scene => {
                scene.classList.remove('current-scene');
                scene.style.display = 'none';
            });
            
            // 显示选中场景
            const targetScene = document.getElementById(sceneId);
            if (targetScene) {
                targetScene.style.display = 'flex';
                targetScene.classList.add('current-scene');
                targetScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        function toggleScripts() {
            scriptsVisible = !scriptsVisible;
            document.querySelectorAll('.script-panel').forEach(panel => {
                panel.classList.toggle('active', scriptsVisible);
            });
        }

        function playAll() {
            autoPlay = true;
            const scenes = {{ animation_data.scenes | map(attribute='scene_id') | list | tojson }};
            let currentIndex = 0;
            
            function playNext() {
                if (currentIndex < scenes.length && autoPlay) {
                    showScene(scenes[currentIndex]);
                    currentIndex++;
                    setTimeout(playNext, 5000); // 每场景5秒
                } else {
                    autoPlay = false;
                }
            }
            
            playNext();
        }

        // 初始化显示第一个场景
        document.addEventListener('DOMContentLoaded', function() {
            {% if animation_data.scenes %}
            showScene('{{ animation_data.scenes[0].scene_id }}');
            {% endif %}
        });

        // 键盘控制
        document.addEventListener('keydown', function(e) {
            if (autoPlay) return;
            
            const scenes = {{ animation_data.scenes | map(attribute='scene_id') | list | tojson }};
            const currentIndex = scenes.findIndex(id => 
                document.getElementById(id).style.display === 'flex'
            );
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                if (currentIndex < scenes.length - 1) {
                    showScene(scenes[currentIndex + 1]);
                }
            } else if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    showScene(scenes[currentIndex - 1]);
                }
            }
        });
    </script>
</body>
</html>"""

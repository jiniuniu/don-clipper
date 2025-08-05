FRONTEND_HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>教育动画生成器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 20px;
            text-align: center;
            color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .main-container {
            flex: 1;
            display: flex;
            height: calc(100vh - 120px);
        }
        
        .left-panel {
            width: 50%;
            padding: 30px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(5px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
        }
        
        .right-panel {
            width: 50%;
            background: white;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .form-group {
            margin-bottom: 25px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            color: white;
            font-size: 1.1em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .form-group textarea {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            font-family: inherit;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .form-group textarea:focus {
            outline: none;
            background: white;
            box-shadow: 0 6px 25px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }
        
        .generate-btn {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            margin-top: 20px;
        }
        
        .generate-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
        }
        
        .generate-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .loading {
            display: none;
            text-align: center;
            color: white;
            margin-top: 20px;
        }
        
        .loading.active {
            display: block;
        }
        
        .spinner {
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .result-container {
            flex: 1;
            position: relative;
            overflow: hidden;
        }
        
        .result-iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }
        
        .placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            background: #f8f9fa;
        }
        
        .placeholder-icon {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        
        .placeholder h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
        }
        
        .placeholder p {
            font-size: 1em;
            opacity: 0.7;
            text-align: center;
            max-width: 300px;
            line-height: 1.5;
        }
        
        .error-message {
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }
        
        .error-message.active {
            display: block;
        }
        
        .success-info {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }
        
        .success-info.active {
            display: block;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
            }
            
            .left-panel, .right-panel {
                width: 100%;
            }
            
            .left-panel {
                height: 50vh;
            }
            
            .right-panel {
                height: 50vh;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎓 教育动画生成器</h1>
        <p>将教学问答转换为生动的可视化动画</p>
    </div>
    
    <div class="main-container">
        <div class="left-panel">
            <div class="form-group">
                <label for="question">📝 教学问题</label>
                <textarea 
                    id="question" 
                    placeholder="请输入要解释的科学问题或概念...&#10;&#10;例如：为什么电子不会掉入原子核？"
                ></textarea>
            </div>
            
            <div class="form-group">
                <label for="answer">💡 详细回答</label>
                <textarea 
                    id="answer" 
                    placeholder="请输入详细的解答内容...&#10;&#10;包含科学原理、关键概念等，内容越详细，生成的动画效果越好。"
                ></textarea>
            </div>
            
            <button class="generate-btn" onclick="generateAnimation()">
                🚀 生成动画
            </button>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>AI正在分析内容并生成动画...</p>
                <small>这可能需要30-60秒，请耐心等待</small>
            </div>
            
            <div class="error-message" id="error-message"></div>
            <div class="success-info" id="success-info"></div>
        </div>
        
        <div class="right-panel">
            <div class="result-container">
                <div class="placeholder" id="placeholder">
                    <div class="placeholder-icon">🎬</div>
                    <h3>动画预览区域</h3>
                    <p>输入问题和答案后，点击"生成动画"按钮，AI生成的教学动画将在此处显示</p>
                </div>
                <iframe class="result-iframe" id="result-iframe" style="display: none;"></iframe>
            </div>
        </div>
    </div>

    <script>
        let isGenerating = false;

        // 预设示例数据
        const SAMPLE_DATA = {
            question: `为什么电子不会掉入原子核？

在经典物理学中，运动的物体最终会因为摩擦或辐射失去能量而减速。但原子中的电子似乎无限期地"轨道运行"，不会螺旋进入原子核或辐射掉它们的能量。

我知道量子力学取代了经典图像，但仍然为什么电子不会随着时间"失去能量"？是什么阻止它们坍缩到原子核中？除了"它只是一个稳定的量子态"之外，是否有明确的物理解释？`,

            answer: `简而言之，这是因为电子实际上已经坍缩到原子核上，并且以原子核为中心。因此，它们没有办法更靠近并在此过程中失去能量。

如果你看氢原子最低轨道(1s)中电子的概率密度(即通常标记为|Ψ|²的量)，你会发现概率在原子核的正中心明显最高。

然而，在实验上，当我们试图确定电子相对于原子核最可能的距离时，我们得到的是径向概率分布。

第一个量是"概率密度"，|Ψ|²，它是在特定空间点找到电子的概率的度量。第二个量是"径向概率"，|Ψ|²r²，它是在给定距离处找到电子的概率的度量。

当你远离原子中心时，"体积"增加。在原子的正中心只有一个点可以找到电子...但随着你向外移动，电子可以位于"更多点"上。

所以，当你从中心向外移动时，概率密度降低...但在给定距离处的球面表面积增加。因此，即使在球体内任何给定点找到电子的概率较低，但球体内可以找到电子的"点"更多...所以径向概率实际上增加，直到你达到波尔半径。`
        };

        // 页面加载时填充示例数据
        window.addEventListener('DOMContentLoaded', function() {
            document.getElementById('question').value = SAMPLE_DATA.question;
            document.getElementById('answer').value = SAMPLE_DATA.answer;
        });

        async function generateAnimation() {
            if (isGenerating) return;
            
            const question = document.getElementById('question').value.trim();
            const answer = document.getElementById('answer').value.trim();
            
            if (!question || !answer) {
                showError('请输入问题和答案');
                return;
            }
            
            isGenerating = true;
            showLoading(true);
            hideError();
            hideSuccess();
            
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: question,
                        answer: answer
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showResult(result.html_content);
                    showSuccess(`✅ 成功生成 ${result.scene_count} 个教学场景！`);
                } else {
                    showError(`生成失败: ${result.error}`);
                }
                
            } catch (error) {
                showError(`请求失败: ${error.message}`);
            } finally {
                isGenerating = false;
                showLoading(false);
            }
        }
        
        function showLoading(show) {
            const loading = document.getElementById('loading');
            const btn = document.querySelector('.generate-btn');
            
            loading.classList.toggle('active', show);
            btn.disabled = show;
            btn.textContent = show ? '⏳ 生成中...' : '🚀 生成动画';
        }
        
        function showResult(htmlContent) {
            const placeholder = document.getElementById('placeholder');
            const iframe = document.getElementById('result-iframe');
            
            placeholder.style.display = 'none';
            iframe.style.display = 'block';
            
            // 将HTML内容写入iframe
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframe.src = url;
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = message;
            errorDiv.classList.add('active');
        }
        
        function hideError() {
            document.getElementById('error-message').classList.remove('active');
        }
        
        function showSuccess(message) {
            const successDiv = document.getElementById('success-info');
            successDiv.textContent = message;
            successDiv.classList.add('active');
        }
        
        function hideSuccess() {
            document.getElementById('success-info').classList.remove('active');
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                generateAnimation();
            }
        });
    </script>
</body>
</html>"""

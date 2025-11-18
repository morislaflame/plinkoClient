import { HEIGHT, WIDTH, ballRadius, obstacleRadius} from "../utils/consts";
import { type Obstacle, type Sink, createObstacles, createSinks } from "../utils/objects";
import { pad, unpad } from "../utils/padding";
import { Ball } from "./Ball";

export class BallManager {
    private balls: Ball[];
    private canvasRef: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private obstacles: Obstacle[]
    private sinks: Sink[]
    private requestId?: number;
    private onFinish?: (index: number,startX?: number) => void;
    private sinkAnimations: Map<number, { startTime: number; duration: number }> = new Map();

    constructor(canvasRef: HTMLCanvasElement, onFinish?: (index: number,startX?: number) => void) {
        this.balls = [];
        this.canvasRef = canvasRef;
        this.ctx = this.canvasRef.getContext("2d")!;
        this.obstacles = createObstacles();
        this.sinks = createSinks();
        this.update();
        this.onFinish = onFinish;
    }

    addBall(startX?: number) {
        const newBall = new Ball(startX || pad(WIDTH / 2 + 13), pad(50), ballRadius, 'red', this.ctx, this.obstacles, this.sinks, (index) => {
            this.balls = this.balls.filter(ball => ball !== newBall);
            // Запускаем анимацию для ячейки
            this.triggerSinkAnimation(index);
            this.onFinish?.(index, startX)
        });
        this.balls.push(newBall);
    }

    triggerSinkAnimation(sinkIndex: number) {
        this.sinkAnimations.set(sinkIndex, {
            startTime: Date.now(),
            duration: 500 // 500ms анимация
        });
    }

    drawObstacles() {
        this.ctx.fillStyle = 'white';
        this.obstacles.forEach((obstacle) => {
            this.ctx.beginPath();
            this.ctx.arc(unpad(obstacle.x), unpad(obstacle.y), obstacle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        });
    }
  
    getColor(index: number) {
        const totalSinks = this.sinks.length; // 17 ячеек
        const centerIndex = Math.floor(totalSinks / 2); // 8 (центральная ячейка)
        
        // Вычисляем расстояние от центра (0 = центр, 8 = край)
        const distanceFromCenter = Math.abs(index - centerIndex);
        
        // Массив цветов от центра к краям
        const colors = [
            '#4cc9f0', // Центр - золотой
            '#4895ef', // Оранжевый
            '#4361ee', // Темно-оранжевый
            '#3f37c9', // Красно-оранжевый
            '#3a0ca3', // Оранжево-красный
            '#480ca8', // Малиновый
            '#560bad', // Темно-красный
            '#7209b7', // Очень темно-красный
            '#b5179e'  // Край - серый
        ];
        
        // Выбираем цвет в зависимости от расстояния от центра
        const colorIndex = Math.min(distanceFromCenter, colors.length - 1);
        
        return {
            background: colors[colorIndex], 
            color: 'white', 
            borderRadius: '10px'
        };
    }
    drawSinks() {
        this.ctx.fillStyle = 'green';
        const SPACING = obstacleRadius * 2;
        const currentTime = Date.now();
        const borderRadius = 8; // Радиус закругления углов
        
        for (let i = 0; i < this.sinks.length; i++) {
            const sink = this.sinks[i];
            const animation = this.sinkAnimations.get(i);
            
            // Вычисляем анимационные эффекты
            let scale = 1;
            let glowIntensity = 0;
            
            if (animation) {
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                
                if (progress < 1) {
                    // Пульсация: увеличение и уменьшение
                    scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
                    // Свечение: плавное затухание
                    glowIntensity = (1 - progress) * 0.3;
                } else {
                    // Удаляем завершенную анимацию
                    this.sinkAnimations.delete(i);
                }
            }
            
            // Основной цвет ячейки
            const colors = this.getColor(i);
            this.ctx.fillStyle = colors.background;
            
            // Добавляем свечение если есть анимация
            if (glowIntensity > 0) {
                this.ctx.shadowColor = colors.background;
                this.ctx.shadowBlur = 20 * glowIntensity;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            // Рисуем ячейку с учетом масштаба
            const scaledWidth = (sink.width - SPACING) * scale;
            const scaledHeight = sink.height * scale;
            const offsetX = ((sink.width - SPACING) - scaledWidth) / 2;
            const offsetY = (sink.height - scaledHeight) / 2;
            
            const x = sink.x + offsetX;
            const y = sink.y - sink.height / 2 + offsetY;
            const width = scaledWidth;
            const height = scaledHeight;
            
            // Рисуем закругленный прямоугольник
            this.ctx.beginPath();
            this.ctx.moveTo(x + borderRadius, y);
            this.ctx.lineTo(x + width - borderRadius, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
            this.ctx.lineTo(x + width, y + height - borderRadius);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
            this.ctx.lineTo(x + borderRadius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
            this.ctx.lineTo(x, y + borderRadius);
            this.ctx.quadraticCurveTo(x, y, x + borderRadius, y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Сбрасываем shadow для текста
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
            
            // Рисуем текст по центру ячейки
            this.ctx.fillStyle = 'white'; // Всегда белый цвет
            this.ctx.font = '14px Arial'; // Жирный шрифт, размер 14px
            this.ctx.textAlign = 'center'; // Выравнивание по центру
            this.ctx.textBaseline = 'middle'; // Вертикальное выравнивание по центру
            
            const text = (sink?.multiplier)?.toString() + "x";
            const centerX = x + width / 2; // Центр ячейки по X
            const centerY = y + height / 2; // Центр ячейки по Y
            
            this.ctx.fillText(text, centerX, centerY);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawObstacles();
        this.drawSinks();
        this.balls.forEach(ball => {
            ball.draw();
            ball.update();
        });
    }
    
    update() {
        this.draw();
        this.requestId = requestAnimationFrame(this.update.bind(this));
    }

    stop() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }
}
import { useState, useEffect } from 'react';
import { 
  Phone, 
  Check, 
  Clock, 
  Shield, 
  Sprout, 
  Droplets, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Star,
  Menu,
  X,
  Percent,
  Award,
  Leaf,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [expandedLawn, setExpandedLawn] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
  const buildApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const LEADS_ENDPOINT = buildApiUrl('/api/leads');

  const submitLead = async (lead: { name: string; phone: string; message?: string }) => {
    const response = await fetch(LEADS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lead)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Не удалось отправить заявку');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSubmissionError(null);

    try {
      await submitLead(formData);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubmitted(false);
        setFormData({ name: '', phone: '' });
      }, 3000);
    } catch (error) {
      console.error('Lead submission failed:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Не удалось отправить заявку');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const benefits = [
    {
      icon: <Clock className="w-10 h-10 text-green-600" />,
      title: 'Всего 2 недели',
      description: 'Первые всходы уже через 5-7 дней, полноценный газон за 14 дней'
    },
    {
      icon: <Shield className="w-10 h-10 text-green-600" />,
      title: 'Гарантия 95%',
      description: 'Гарантированный всход семян при соблюдении технологии'
    },
    {
      icon: <Sprout className="w-10 h-10 text-green-600" />,
      title: 'Ровный газон',
      description: 'Идеально ровное покрытие без проплешин и сорняков'
    },
    {
      icon: <Droplets className="w-10 h-10 text-green-600" />,
      title: 'Экономия воды',
      description: 'В 3 раза меньше воды по сравнению с традиционным посевом'
    },
    {
      icon: <Leaf className="w-10 h-10 text-green-600" />,
      title: 'Удобрения в составе',
      description: 'Мульча и питательные вещества уже в смеси'
    },
    {
      icon: <Award className="w-10 h-10 text-green-600" />,
      title: 'Без пересадки',
      description: 'Газон растёт на месте, корни уходят глубоко сразу'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Подготовка почвы',
      description: 'Очистка участка, выравнивание, внесение базовых удобрений'
    },
    {
      number: '02',
      title: 'Нанесение смеси',
      description: 'Гидропосев специальной смеси семян, мульчи и удобрений'
    },
    {
      number: '03',
      title: 'Полив и уход',
      description: 'Регулярный полив первые 2 недели для лучшего прорастания'
    },
    {
      number: '04',
      title: 'Готовый газон',
      description: 'Через 14 дней наслаждайтесь густым зелёным покрытием'
    }
  ];

  const lawnTypes = [
    {
      title: 'Партерные газоны',
      description: 'Декоративные газоны для элитных ландшафтов. Идеально ровная поверхность, насыщенный зелёный цвет.',
      features: ['Переносит легкую тень', 'Овсяница красная 35-40 г/см²', 'Мятлик луговой 10-15 г/см²'],
      image: '/lawn1.jpg'
    },
    {
      title: 'Садово-парковый газон',
      description: 'Универсальный газон для садов и парков. Выдерживает умеренную нагрузку, красивый внешний вид.',
      features: ['Для среднеплодородной почвы', 'Переносит вытаптывание', 'Подходит для полутени'],
      image: '/lawn2.jpg'
    },
    {
      title: 'Мавританский газон',
      description: 'Пестроцветный газон с разноцветными цветами. Создаёт живописный цветочный ковёр на вашем участке.',
      features: ['Разноцветные цветы', 'Не требует частого скашивания', 'Привлекает пчёл и бабочек'],
      image: '/lawn3.jpg'
    },
    {
      title: 'Луговой газон',
      description: 'Натуральный луговой газон с разнотравьем. Максимально приближён к природным лугам.',
      features: ['Минимальный уход', 'Высокая засухоустойчивость', 'Естественный вид'],
      image: '/lawn4.jpg'
    },
    {
      title: 'Спортивный газон',
      description: 'Прочный газон для спортивных площадок. Выдерживает интенсивные нагрузки и быстро восстанавливается.',
      features: ['Мятлик луговой 25-30 г/см²', 'Овсяница красная 15-20 г/см²', 'Высокая износостойкость'],
      image: '/lawn2.jpg'
    },
    {
      title: 'Теневыносливый газон',
      description: 'Для затененных участков под деревьями. Состоит из теневыносливых злаков, растет медленно, но устойчив к полутени.',
      features: ['Овсяница теневыносливая', 'Мятлик луговой', 'Устойчив к полутени', 'Медленный рост'],
      image: '/lawn5.jpg'
    }
  ];

  const reviews = [
    {
      name: 'Александр Петров',
      location: 'Пермь',
      text: 'Заказывали гидропосев для дачи 15 соток. Результат превзошёл ожидания! Через 2 недели уже был полноценный газон. Рекомендую!',
      rating: 5
    },
    {
      name: 'Елена Смирнова',
      location: 'с. Култаево',
      text: 'Очень довольны работой. Быстро, качественно, без грязи и пыли. Газон равномерный, зелёный, густой. Спасибо!',
      rating: 5
    },
    {
      name: 'Дмитрий Иванов',
      location: 'Пермь',
      text: 'Сравнивали с рулонным газоном — гидропосев вышел дешевле и результат лучше. Корни глубокие, газон не выгорает.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-xl ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              Газон АкваГрин
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Виды газонов', id: 'lawn-types' },
              { label: 'Преимущества', id: 'benefits' },
              { label: 'Процесс', id: 'process' },
              { label: 'Отзывы', id: 'reviews' },
              { label: 'Контакты', id: 'contacts' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a 
              href="tel:+79125893009" 
              className={`font-semibold transition-opacity duration-300 ${
                isScrolled 
                  ? 'text-gray-800 hover:text-gray-600' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              +7 (912) 589-30-09
            </a>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Заказать
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t mt-3">
            <nav className="flex flex-col p-4 gap-3">
              {[
                { label: 'Виды газонов', id: 'lawn-types' },
                { label: 'Преимущества', id: 'benefits' },
                { label: 'Процесс', id: 'process' },
                { label: 'Отзывы', id: 'reviews' },
                { label: 'Контакты', id: 'contacts' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 text-gray-700 font-medium"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white mt-2"
              >
                Заказать
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background with lawn images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-700/80 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/lawn3.jpg)' }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">Более 500 выполненных проектов в Перми</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Гидропосев газона
                <span className="block text-green-300">за 2 недели</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                Идеальный газон без хлопот! Гарантированный всход 95%, 
                ровное покрытие без проплешин. Экономьте время и деньги 
                с современной технологией посева.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white/90">Гарантия результата</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white/90">Работаем по договору</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white/90">Бесплатный выезд</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6 shadow-glow"
                >
                  Рассчитать стоимость
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <a 
                  href="https://max.ru/id5905056440_1_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Узнать стоимость за 5 минут
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Скидка 15%</h3>
                  <p className="text-gray-600 text-sm">При заказе до конца месяца</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя
                  </label>
                  <Input 
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <Input 
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Получить скидку 15%
                    </>
                  )}
                </Button>
                {submissionError && (
                  <p className="text-sm text-red-500 text-center">{submissionError}</p>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>

              {isSubmitted && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Спасибо! Мы перезвоним вам в течение 15 минут</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="w-6 h-6 text-white/60 rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-green-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-green-100">Выполненных проектов</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-green-100">Гарантия всхода</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">14</div>
              <div className="text-green-100">Дней до результата</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5</div>
              <div className="text-green-100">Лет гарантии</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Как работает <span className="text-green-400">гидропосев</span>
            </h2>
            <p className="text-lg text-gray-400">
              Посмотрите видео процесса создания идеального газона
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
              {!showVideo ? (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                  onClick={() => setShowVideo(true)}
                >
                  <img 
                    src="/lawn1.jpg" 
                    alt="Превью видео" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="relative z-10 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              ) : (
                <video 
                  src="/hydroseed.mp4" 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                  onEnded={() => setShowVideo(false)}
                />
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Video className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Подготовка смеси</h4>
                <p className="text-gray-400 text-sm">Семена, мульча и удобрения смешиваются в специальном баке</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Droplets className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Нанесение на участок</h4>
                <p className="text-gray-400 text-sm">Смесь распыляется под давлением на подготовленную почву</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Sprout className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Прорастание</h4>
                <p className="text-gray-400 text-sm">Первые всходы через 5-7 дней, готовый газон за 14 дней</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lawn Types Section */}
      <section id="lawn-types" className="py-20 bg-gradient-green">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Виды <span className="text-gradient">газонов</span>
            </h2>
            <p className="text-lg text-gray-600">
              Выберите подходящий тип газона для вашего участка. 
              Мы подберём оптимальную травосмесь под ваши задачи.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawnTypes.map((lawn, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={lawn.image} 
                    alt={lawn.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lawn.title}</h3>
                  <p className="text-gray-600 mb-4">{lawn.description}</p>
                  
                  <button
                    onClick={() => setExpandedLawn(expandedLawn === index ? null : index)}
                    className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700"
                  >
                    {expandedLawn === index ? 'Свернуть' : 'Подробнее'}
                    {expandedLawn === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {expandedLawn === index && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ul className="space-y-2">
                        {lawn.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают <span className="text-gradient">гидропосев</span>
            </h2>
            <p className="text-lg text-gray-600">
              Современная технология, которая обеспечивает быстрый и гарантированный 
              результат при минимальных затратах
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-green-100"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gradient-green">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Гидропосев vs Рулонный газон
            </h2>
            <p className="text-lg text-gray-600">
              Сравните преимущества и сделайте правильный выбор
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Hydroseeding */}
            <div className="bg-white rounded-3xl p-8 border-2 border-green-500 relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                РЕКОМЕНДУЕМ
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-6">Гидропосев</h3>
              <ul className="space-y-4">
                {[
                  'В 2-3 раза дешевле рулонного',
                  'Корни растут глубоко сразу',
                  'Не выгорает на солнце',
                  'Можно выбрать любую травосмесь',
                  'Ровное покрытие без швов',
                  'Экологично и безопасно'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-green-200">
                <div className="text-3xl font-bold text-green-700">от 150 ₽/м²</div>
              </div>
            </div>

            {/* Roll Lawn */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-700 mb-6">Рулонный газон</h3>
              <ul className="space-y-4">
                {[
                  'Высокая стоимость материала',
                  'Корни поверхностные',
                  'Часто выгорает первое лето',
                  'Ограниченный выбор травы',
                  'Видны швы между рулонами',
                  'Требует частого полива'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-3xl font-bold text-gray-700">от 400 ₽/м²</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Как мы <span className="text-gradient">работаем</span>
            </h2>
            <p className="text-lg text-gray-600">
              Чёткий алгоритм действий от замера до готового газона
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-green-50 rounded-2xl p-6 h-full border border-green-100">
                  <div className="text-5xl font-bold text-green-200 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-green">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Наши <span className="text-gradient">результаты</span>
            </h2>
            <p className="text-lg text-gray-600">
              Реальные фотографии выполненных проектов в Перми и Пермском крае
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-2xl aspect-square">
              <img 
                src="/lawn1.jpg" 
                alt="Газон после гидропосева" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-bold">Частный дом</div>
                <div className="text-sm text-white/80">Пермь, 500 м²</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl aspect-square">
              <img 
                src="/lawn2.jpg" 
                alt="Газон у дома" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-bold">Коттеджный посёлок</div>
                <div className="text-sm text-white/80">Култаево, 1200 м²</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl aspect-square">
              <img 
                src="/lawn3.jpg" 
                alt="Зелёный газон" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-bold">Ландшафтный дизайн</div>
                <div className="text-sm text-white/80">Пермь, 800 м²</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl aspect-square">
              <img 
                src="/lawn4.jpg" 
                alt="Свежий газон" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-bold">Спортивная площадка</div>
                <div className="text-sm text-white/80">Пермь, 600 м²</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Отзывы <span className="text-gradient">клиентов</span>
            </h2>
            <p className="text-lg text-gray-600">
              Что говорят о нас наши заказчики в Перми и Пермском крае
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold">{review.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telegram Bot CTA Section */}
      <section className="py-16 bg-blue-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <MessageCircle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Узнайте стоимость вашего газона за 5 минут
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Напишите нашему боту в Telegram — быстрый расчёт стоимости 
              без лишних звонков
            </p>
            <a 
              href="https://max.ru/id5905056440_1_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 font-bold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Написать в Telegram
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/lawn1.jpg)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold mb-6">
              <Percent className="w-5 h-5" />
              Акция ограничена!
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Получите скидку 15% на гидропосев
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Оставьте заявку до конца месяца и получите специальную цену 
              + бесплатный выезд специалиста на замер в Перми и Пермском крае
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-lg px-8 py-6 font-bold shadow-glow-yellow"
              >
                Получить скидку 15%
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="tel:+79125893009">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white text-gray-900 border-white hover:bg-yellow-400 hover:border-yellow-400 hover:text-gray-900 text-lg px-8 py-6"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">Газон АкваГрин</span>
              </div>
              <p className="text-gray-400 mb-4">
                Профессиональный гидропосев газона с гарантией результата. 
                Работаем в Перми и Пермском крае.
              </p>
              <a 
                href="https://max.ru/id5905056440_1_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <MessageCircle className="w-5 h-5" />
                Написать в Telegram
              </a>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Услуги</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Гидропосев газона</li>
                <li>Партерные газоны</li>
                <li>Спортивные газоны</li>
                <li>Укрепление откосов</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Контакты</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +7 (912) 589-30-09
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Пермь, с. Култаево
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Пн-Сб: 9:00 - 20:00
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Быстрая связь</h4>
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                >
                  Оставить заявку
                </Button>
                <a 
                  href="https://max.ru/id5905056440_1_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10 w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Telegram бот
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2026 Газон АкваГрин. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Получить скидку 15%
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-600 text-center mb-6">
              Оставьте контакты и мы перезвоним вам в течение 15 минут
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя
                </label>
                <Input 
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <Input 
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSending}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
              >
                {isSending ? (
                  <>
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Получить скидку
                  </>
                )}
              </Button>
              {submissionError && (
                <p className="text-sm text-red-500 text-center">{submissionError}</p>
              )}
            </form>
            {isSubmitted && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Спасибо! Мы скоро свяжемся с вами</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;

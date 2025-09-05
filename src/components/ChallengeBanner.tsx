const ChallengeBanner = () => {
  const activityBlocks = [
    {
      title: "СИЛА",
      color: "bg-gradient-to-br from-red-400 to-red-600",
      shadowColor: "shadow-red-500/50",
      icon: (
        <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L8 7.5h3v9h2v-9h3L12 3zm-7 9.5h2v5H5v-5zm14 0h2v5h-2v-5z"/>
        </svg>
      ),
      description: "Чаще всего выбивает силовые нагрузки и работу с весом",
      points: "10 баллов",
      emoji: "💪"
    },
    {
      title: "КАРДИО", 
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      shadowColor: "shadow-orange-500/50",
      icon: (
        <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
        </svg>
      ),
      description: "Выносливость: бег, велосипед, плавание, аэробика",
      points: "10 баллов",
      emoji: "❤️"
    },
    {
      title: "БАЛАНС",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      shadowColor: "shadow-blue-500/50",
      icon: (
        <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      ),
      description: "Гибкость, устойчивость, восстановление энергии",
      points: "10 баллов",
      emoji: "🧘"
    },
    {
      title: "АЛЬТЕРНАТИВА",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      shadowColor: "shadow-green-500/50",
      icon: (
        <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16,4C18.2,4 20,5.8 20,8C20,10.2 18.2,12 16,12C13.8,12 12,10.2 12,8C12,5.8 13.8,4 16,4M16,14C18.7,14 24,15.3 24,18V20H8V18C8,15.3 13.3,14 16,14Z"/>
        </svg>
      ),
      description: "Упрощённые нагрузки",
      points: "5 баллов",
      emoji: "🌟"
    }
  ];

  const strengthActivities = [
    "≥ 45 мин",
    "Отжимания",
    "Подтягивания", 
    "Приседания / выпады",
    "Скручивания",
    "Кроссфит",
    "Функциональные тренировки с собственным весом"
  ];

  const cardioActivities = [
    "≥ 45 мин",
    "Бег > 5 км",
    "Велосипед > 10 км / велотренажер", 
    "Скакалка",
    "Плавание",
    "Танцевальные программы",
    "Групповые кардио-занятия"
  ];

  const balanceActivities = [
    "≥ 45 мин",
    "Йога",
    "Пилатес",
    "Cтретчинг",
    "Растяжка",
    "Медитация",
    "Дыхательная гимнастика"
  ];

  const alternativeActivities = [
    "≥ 30 мин",
    "Лёгкий бег трусцой в комфортном темпе",
    "Велотренажёр / велосипед на низкой нагрузке",
    "Круговая тренировка для новичков (низкая интенсивность)",
    "ЛФК / упражнения с эспандером"
  ];



  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-5xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 uppercase tracking-wide drop-shadow-lg">
            🏆 СПОРТИВНЫЙ ЧЕЛЛЕНДЖ 🏆
          </h1>
          <p className="text-xl text-gray-800">
            2 команды, 2 месяца тренировок, суперфинал <span className="text-purple-600 animate-pulse">и</span> квиз – прокачай себя!
          </p>
        </div>
      </div>



      {/* Activity Classes */}
      <div className="mb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 uppercase text-center">
            ⚡ ВЕТКИ ПРОКАЧКИ ⚡
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {activityBlocks.map((block, index) => (
              <div key={index} className={`${block.color} ${block.shadowColor} rounded-2xl p-6 text-white text-center flex flex-col h-full transform transition-all duration-300 hover:scale-110 hover:rotate-1 hover:shadow-2xl cursor-pointer border border-white/20`}>
                <div className="text-4xl mb-4">{block.emoji}</div>
                <div className="flex justify-center mb-4 animate-bounce">
                  {block.icon}
                </div>
                <h3 className="text-xl mb-3 uppercase tracking-wider font-normal text-[24px] drop-shadow-lg">
                  {block.title}
                </h3>
                <p className="text-sm mb-4 leading-relaxed flex-grow drop-shadow">
                  {block.description}
                </p>
                <div className="text-3xl text-[20px] mt-auto bg-white/20 rounded-xl py-2 backdrop-blur-sm">
                  ⭐ {block.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Standards */}
      <div className="mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-8 uppercase text-center">
            📋 НОРМАТИВЫ ПО АКТИВНОСТИ
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Strength Activities */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-2xl shadow-lg">
                <h3 className="text-lg uppercase">🏋️ СИЛА 💪</h3>
              </div>
              <div className="bg-white p-4 rounded-b-2xl border-2 border-red-500 min-h-[200px] shadow-xl">
                <ul className="space-y-2">
                  {strengthActivities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm hover:bg-red-50 p-1 rounded transition-colors">
                      <span className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-3 flex-shrink-0 animate-pulse"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cardio Activities */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl shadow-lg">
                <h3 className="text-lg uppercase">🏃 КАРДИО ❤️</h3>
              </div>
              <div className="bg-white p-4 rounded-b-2xl border-2 border-orange-500 min-h-[200px] shadow-xl">
                <ul className="space-y-2">
                  {cardioActivities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm hover:bg-orange-50 p-1 rounded transition-colors">
                      <span className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-3 flex-shrink-0 animate-pulse"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Balance Activities */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl shadow-lg">
                <h3 className="text-lg uppercase">🧘 БАЛАНС ⚖️</h3>
              </div>
              <div className="bg-white p-4 rounded-b-2xl border-2 border-blue-500 min-h-[200px] shadow-xl">
                <ul className="space-y-2">
                  {balanceActivities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm hover:bg-blue-50 p-1 rounded transition-colors">
                      <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3 flex-shrink-0 animate-pulse"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternative Activities */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl shadow-lg">
                <h3 className="text-lg uppercase">🌟 АЛЬТЕРНАТИВА 🌿</h3>
              </div>
              <div className="bg-white p-4 rounded-b-2xl border-2 border-green-500 min-h-[200px] shadow-xl">
                <ul className="space-y-2">
                  {alternativeActivities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm hover:bg-green-50 p-1 rounded transition-colors">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3 flex-shrink-0 animate-pulse"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-105">
          <h3 className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 uppercase text-center">
            🎯 НАЧИСЛЕНИЕ БАЛЛОВ
          </h3>
          <ul className="text-sm space-y-3 text-gray-700">
            <li className="flex items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-500 mr-2">⭐</span>
              В день учитывается только одна тренировка, максимум 10 баллов
            </li>
            <li className="flex items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-500 mr-2">💯</span>
              Полноценная тренировка 10 баллов
            </li>
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="text-green-500 mr-2">🌟</span>
              Лайт-тренировки альтернативные 5 баллов
            </li>
            <li className="flex items-center p-2 bg-orange-50 rounded-lg">
              <span className="text-orange-500 mr-2">📊</span>
              Сумма очков суммируется за весь период
            </li>
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-105">
          <h3 className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 uppercase text-center">
            📱 ПОДТВЕРЖДЕНИЕ АКТИВНОСТИ
          </h3>
          <ul className="text-sm space-y-3 text-gray-700">
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="text-green-500 mr-2">📸</span>
              Скриншоты тренировок
            </li>
            <li className="flex items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-500 mr-2">⌚</span>
              Логи спортивных приложений, смарт-часы
            </li>
            <li className="flex items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-500 mr-2">✅</span>
              Активности и нормативы вне основного списка необходимо согласовать отдельно
            </li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center mt-12">
        <button className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-12 py-4 rounded-full text-xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 animate-pulse border border-white/30">
          🚀 НАЧАТЬ ЧЕЛЛЕНДЖ 🚀
        </button>
      </div>
    </div>
  );
};

export default ChallengeBanner;
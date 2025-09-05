import { useState } from 'react';
import * as React from 'react';
import Analytics from './Analytics';

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  track: string;
  team: string;
  points: number; // Общие баллы (сумма всех веток)
  trackPoints: Record<string, number>; // Баллы по веткам прокачки
  achievements: string[];
  status: 'approved' | 'pending';
}

interface Achievement {
  id: number;
  title: string;
}

const ChallengeBanner = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  
  // Load teams from localStorage or use default
  const [teams, setTeams] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challengeTeams');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      team1: 'Команда 1',
      team2: 'Команда 2'
    };
  });

  // Load participants from localStorage or use default
  const [participants, setParticipants] = useState<Participant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challengeParticipants');
      if (saved) {
        const loadedParticipants = JSON.parse(saved);
        // Migrate old format to new format with trackPoints
        return loadedParticipants.map((p: any) => ({
          ...p,
          trackPoints: p.trackPoints || { 'СИЛА': 0, 'КАРДИО': 0, 'БАЛАНС': 0, 'АЛЬТЕРНАТИВА': 0 }
        }));
      }
    }
    return [
      { 
        id: 1, firstName: "Анна", lastName: "Норейка", track: "КАРДИО", team: 'Команда 1', points: 85, 
        trackPoints: { 'СИЛА': 15, 'КАРДИО': 35, 'БАЛАНС': 20, 'АЛЬТЕРНАТИВА': 15 },
        achievements: ["Первые шаги", "Покоритель баллов"], status: 'approved' as const
      },
      { 
        id: 2, firstName: "Алексей", lastName: "Петров", track: "СИЛА", team: 'Команда 1', points: 72,
        trackPoints: { 'СИЛА': 40, 'КАРДИО': 15, 'БАЛАНС': 12, 'АЛЬТЕРНАТИВА': 5 },
        achievements: ["Первые шаги"], status: 'approved' as const
      },
      { 
        id: 3, firstName: "Мария", lastName: "Иванова", track: "БАЛАНС", team: 'Команда 2', points: 68,
        trackPoints: { 'СИЛА': 10, 'КАРДИО': 18, 'БАЛАНС': 30, 'АЛЬТЕРНАТИВА': 10 },
        achievements: ["Первые шаги"], status: 'approved' as const
      },
      { 
        id: 4, firstName: "Дмитрий", lastName: "Сидоров", track: "АЛЬТЕРНАТИВА", team: 'Команда 2', points: 45,
        trackPoints: { 'СИЛА': 8, 'КАРДИО': 12, 'БАЛАНС': 10, 'АЛЬТЕРНАТИВА': 15 },
        achievements: ["Первые шаги"], status: 'approved' as const
      },
    ];
  });

  // Load pending applications from localStorage or use default  
  const [pendingApplications, setPendingApplications] = useState<Participant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challengePendingApplications');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [];
  });
  
  // State for pending application approval
  const [approvingApplication, setApprovingApplication] = useState<number | null>(null);
  const [selectedTeamForApproval, setSelectedTeamForApproval] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    track: ''
  });

  const [currentAchievementSlide, setCurrentAchievementSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const achievementsGridRef = React.useRef<HTMLDivElement>(null);
  
  // Admin form states
  const [adminForm, setAdminForm] = useState({
    participantId: '',
    points: '',
    achievement: '',
    selectedTrackBranch: '' // Добавляем выбор ветки прокачки
  });
  const [newParticipantForm, setNewParticipantForm] = useState({
    firstName: '',
    lastName: '',
    track: ''
  });
  
  const [showWrongPasswordImage, setShowWrongPasswordImage] = useState(false);
  const [editingTeams, setEditingTeams] = useState({ team1: '', team2: '' });

  // Load challenge settings from localStorage or use default
  const [challengeSettings, setChallengeSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challengeSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      startDate: '',
      duration: 60 // days
    };
  });
  
  const [isChallengeSettingsOpen, setIsChallengeSettingsOpen] = useState(false);
  const [editingChallengeSettings, setEditingChallengeSettings] = useState({
    startDate: '',
    duration: 60
  });

  // Load track branches from localStorage or use default
  const [trackBranches, setTrackBranches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challengeTrackBranches');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return ['СИЛА', 'КАРДИО', 'БАЛАНС', 'АЛЬТЕРНАТИВА'];
  });
  
  const [isTrackBranchesOpen, setIsTrackBranchesOpen] = useState(false);
  const [editingTrackBranches, setEditingTrackBranches] = useState<string[]>([]);

  // Available achievements for admin
  const availableAchievements: Achievement[] = [
    { id: 1, title: "Победитель этапа" },
    { id: 2, title: "Лучший дизайн" },
    { id: 3, title: "Приз зрительских симпатий" },
    { id: 4, title: "Мотиватор команды" },
    { id: 5, title: "Креативность" },
    { id: 6, title: "Настойчивость" },
    { id: 7, title: "Лидерство" },
    { id: 8, title: "Командный игрок" }
  ];

  // Save participants to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('challengeParticipants', JSON.stringify(participants));
    }
  }, [participants]);

  // Save pending applications to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('challengePendingApplications', JSON.stringify(pendingApplications));
    }
  }, [pendingApplications]);

  // Save teams to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('challengeTeams', JSON.stringify(teams));
    }
  }, [teams]);

  // Save challenge settings to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('challengeSettings', JSON.stringify(challengeSettings));
    }
  }, [challengeSettings]);

  // Save track branches to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('challengeTrackBranches', JSON.stringify(trackBranches));
    }
  }, [trackBranches]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.track) {
      const newApplication: Participant = {
        id: Math.max(...participants.map(p => p.id), ...pendingApplications.map(p => p.id), 0) + 1,
        firstName: formData.firstName,
        lastName: formData.lastName,
        track: formData.track,
        team: '', // Will be assigned when approved
        points: 0,
        achievements: [],
        status: 'pending'
      };
      setPendingApplications([...pendingApplications, newApplication]);
      setFormData({ firstName: '', lastName: '', track: '' });
      setIsFormOpen(false);
      
      // Show success message
      alert('Заявка отправлена! Ожидайте подтверждения от администратора.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Bobby') {
      setIsAdminAuthorized(true);
      setAdminPassword('');
      setShowWrongPasswordImage(false);
    } else {
      setShowWrongPasswordImage(true);
      setAdminPassword('');
      setTimeout(() => setShowWrongPasswordImage(false), 3000);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const participantId = parseInt(adminForm.participantId);
    const pointsToAdd = parseInt(adminForm.points);
    
    if (participantId && adminForm.points !== '' && adminForm.selectedTrackBranch) {
      setParticipants(prev => prev.map(participant => {
        if (participant.id === participantId) {
          const updatedTrackPoints = {
            ...participant.trackPoints,
            [adminForm.selectedTrackBranch]: (participant.trackPoints[adminForm.selectedTrackBranch] || 0) + pointsToAdd
          };
          
          // Пересчитываем общие баллы как сумму всех веток
          const totalPoints = Object.values(updatedTrackPoints).reduce((sum, points) => sum + points, 0);
          
          const updatedParticipant = {
            ...participant,
            points: totalPoints,
            trackPoints: updatedTrackPoints,
            achievements: adminForm.achievement && !participant.achievements.includes(adminForm.achievement)
              ? [...participant.achievements, adminForm.achievement]
              : participant.achievements
          };
          return updatedParticipant;
        }
        return participant;
      }));
      setAdminForm({ participantId: '', points: '', achievement: '', selectedTrackBranch: '' });
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipantForm.firstName && newParticipantForm.lastName && newParticipantForm.track) {
      // Инициализируем баллы по веткам нулями
      const initialTrackPoints: Record<string, number> = {};
      trackBranches.forEach(branch => {
        initialTrackPoints[branch] = 0;
      });
      
      const newParticipant: Participant = {
        id: Math.max(...participants.map(p => p.id), ...pendingApplications.map(p => p.id), 0) + 1,
        firstName: newParticipantForm.firstName,
        lastName: newParticipantForm.lastName,
        track: newParticipantForm.track,
        team: teams.team1, // Default to first team
        points: 0,
        trackPoints: initialTrackPoints,
        achievements: [],
        status: 'approved'
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantForm({ firstName: '', lastName: '', track: '' });
    }
  };

  const handleDeleteParticipant = (participantId: number) => {
    const participant = participants.find(p => p.id === participantId);
    if (participant && window.confirm(`Вы уверены, что хотите удалить участника ${participant.firstName} ${participant.lastName}?`)) {
      setParticipants(participants.filter(p => p.id !== participantId));
    }
  };

  const handleStartApproval = (applicationId: number) => {
    setApprovingApplication(applicationId);
    setSelectedTeamForApproval(teams.team1); // Default to first team
  };

  const handleApproveApplication = () => {
    if (approvingApplication && selectedTeamForApproval) {
      const application = pendingApplications.find(app => app.id === approvingApplication);
      if (application) {
        // Инициализируем баллы по веткам нулями для нового участника
        const initialTrackPoints: Record<string, number> = {};
        trackBranches.forEach(branch => {
          initialTrackPoints[branch] = 0;
        });
        
        const approvedParticipant: Participant = {
          ...application,
          team: selectedTeamForApproval,
          trackPoints: application.trackPoints || initialTrackPoints,
          status: 'approved'
        };
        setParticipants([...participants, approvedParticipant]);
        setPendingApplications(pendingApplications.filter(app => app.id !== approvingApplication));
        setApprovingApplication(null);
        setSelectedTeamForApproval('');
      }
    }
  };

  const handleCancelApproval = () => {
    setApprovingApplication(null);
    setSelectedTeamForApproval('');
  };

  const handleRejectApplication = (applicationId: number) => {
    setPendingApplications(pendingApplications.filter(app => app.id !== applicationId));
    if (approvingApplication === applicationId) {
      handleCancelApproval();
    }
  };

  const handleChangeParticipantTeam = (participantId: number, newTeam: string) => {
    setParticipants(prev => prev.map(participant => 
      participant.id === participantId 
        ? { ...participant, team: newTeam }
        : participant
    ));
  };

  const handleOpenTeamEditor = () => {
    setEditingTeams({ team1: teams.team1, team2: teams.team2 });
    setIsTeamEditorOpen(true);
  };

  const handleSaveTeams = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeams.team1.trim() && editingTeams.team2.trim()) {
      const oldTeams = { ...teams };
      const newTeams = { team1: editingTeams.team1.trim(), team2: editingTeams.team2.trim() };
      
      // Update team names for all participants
      setParticipants(prev => prev.map(participant => {
        if (participant.team === oldTeams.team1) {
          return { ...participant, team: newTeams.team1 };
        } else if (participant.team === oldTeams.team2) {
          return { ...participant, team: newTeams.team2 };
        }
        return participant;
      }));

      setTeams(newTeams);
      setIsTeamEditorOpen(false);
    }
  };

  const handleOpenChallengeSettings = () => {
    setEditingChallengeSettings({
      startDate: challengeSettings.startDate,
      duration: challengeSettings.duration
    });
    setIsChallengeSettingsOpen(true);
  };

  const handleSaveChallengeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChallengeSettings.startDate && editingChallengeSettings.duration > 0) {
      setChallengeSettings({
        startDate: editingChallengeSettings.startDate,
        duration: editingChallengeSettings.duration
      });
      setIsChallengeSettingsOpen(false);
    }
  };

  const handleOpenTrackBranches = () => {
    setEditingTrackBranches([...trackBranches]);
    setIsTrackBranchesOpen(true);
  };

  const handleSaveTrackBranches = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredBranches = editingTrackBranches.filter(branch => branch.trim() !== '');
    if (filteredBranches.length > 0) {
      setTrackBranches(filteredBranches);
      
      // Обновляем trackPoints всех участников, чтобы включить новые ветки
      setParticipants(prev => prev.map(participant => {
        const updatedTrackPoints = { ...participant.trackPoints };
        
        // Добавляем новые ветки с нулевыми баллами
        filteredBranches.forEach(branch => {
          if (!(branch in updatedTrackPoints)) {
            updatedTrackPoints[branch] = 0;
          }
        });
        
        // Удаляем ветки, которых больше нет в списке
        Object.keys(updatedTrackPoints).forEach(branch => {
          if (!filteredBranches.includes(branch)) {
            delete updatedTrackPoints[branch];
          }
        });
        
        // Пересчитываем общие баллы
        const totalPoints = Object.values(updatedTrackPoints).reduce((sum, points) => sum + points, 0);
        
        return {
          ...participant,
          trackPoints: updatedTrackPoints,
          points: totalPoints
        };
      }));
      
      setIsTrackBranchesOpen(false);
    }
  };

  const handleAddTrackBranch = () => {
    setEditingTrackBranches([...editingTrackBranches, '']);
  };

  const handleRemoveTrackBranch = (index: number) => {
    if (editingTrackBranches.length > 1) {
      setEditingTrackBranches(editingTrackBranches.filter((_, i) => i !== index));
    }
  };

  const handleUpdateTrackBranch = (index: number, value: string) => {
    const updated = [...editingTrackBranches];
    updated[index] = value;
    setEditingTrackBranches(updated);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthorized(false);
    setIsAdminOpen(false);
    setAdminPassword('');
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'СИЛА': return 'bg-red-500';
      case 'КАРДИО': return 'bg-orange-500';
      case 'БАЛАНС': return 'bg-blue-500';
      case 'АЛЬТЕРНАТИВА': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackEmoji = (track: string) => {
    switch (track) {
      case 'СИЛА': return '💪';
      case 'КАРДИО': return '❤️';
      case 'БАЛАНС': return '🧘';
      case 'АЛЬТЕРНАТИВА': return '🌟';
      default: return '⭐';
    }
  };
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

  const achievements = [
    { 
      id: 1,
      title: "Первые шаги", 
      description: "Набери первые 10 баллов", 
      icon: "🌱", 
      unlocked: true,
      gradient: "from-green-400 to-emerald-500"
    },
    { 
      id: 2,
      title: "Покоритель баллов", 
      description: "Набери 30 баллов", 
      icon: "⭐", 
      unlocked: true,
      gradient: "from-yellow-400 to-orange-500"
    },
    { 
      id: 3,
      title: "Сила-50", 
      description: "Набери 50 баллов в силовых", 
      icon: "💪", 
      unlocked: false,
      gradient: "from-red-400 to-red-600"
    },
    { 
      id: 4,
      title: "Кардио-мастер", 
      description: "50 баллов в кардио", 
      icon: "❤️", 
      unlocked: false,
      gradient: "from-orange-400 to-red-500"
    },
    { 
      id: 5,
      title: "Баланс-гуру", 
      description: "50 баллов в балансе", 
      icon: "🧘", 
      unlocked: false,
      gradient: "from-blue-400 to-indigo-500"
    },
    { 
      id: 6,
      title: "Аватар 4-х стихий", 
      description: "По 25 баллов в каждой ветке", 
      icon: "🔥", 
      unlocked: false,
      gradient: "from-purple-400 to-pink-500"
    },
    { 
      id: 7,
      title: "Неделя силы", 
      description: "7 дней подряд тренировок", 
      icon: "⚡", 
      unlocked: false,
      gradient: "from-indigo-400 to-purple-500"
    },
    { 
      id: 8,
      title: "Марафонец", 
      description: "30 дней активности", 
      icon: "🏃‍♂️", 
      unlocked: false,
      gradient: "from-teal-400 to-cyan-500"
    },
    { 
      id: 9,
      title: "Сотка", 
      description: "Набери 100 баллов", 
      icon: "💯", 
      unlocked: false,
      gradient: "from-emerald-400 to-green-600"
    },
    { 
      id: 10,
      title: "Чемпион", 
      description: "Завершить челлендж", 
      icon: "👑", 
      unlocked: false,
      gradient: "from-yellow-400 to-yellow-600"
    }
  ];

  const achievementsPerSlide = 5;
  const totalSlides = Math.ceil(achievements.length / achievementsPerSlide);

  const getCurrentAchievements = () => {
    const startIndex = currentAchievementSlide * achievementsPerSlide;
    return achievements.slice(startIndex, startIndex + achievementsPerSlide);
  };

  const nextAchievementSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentAchievementSlide((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevAchievementSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentAchievementSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (slideIndex: number) => {
    if (isAnimating || slideIndex === currentAchievementSlide) return;
    setIsAnimating(true);
    setCurrentAchievementSlide(slideIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Handle mouse wheel scroll on achievements
  const handleAchievementsWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (isAnimating) return;
    
    if (e.deltaY > 0) {
      // Scroll down - next slide
      nextAchievementSlide();
    } else {
      // Scroll up - previous slide
      prevAchievementSlide();
    }
  };

  // Challenge status logic
  const getChallengeStatus = () => {
    if (!challengeSettings.startDate) {
      return { status: 'not-configured', daysLeft: 0, daysElapsed: 0, progress: 0 };
    }

    const now = new Date();
    const startDate = new Date(challengeSettings.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + challengeSettings.duration);

    if (now < startDate) {
      const timeDiff = startDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return { status: 'not-started', daysLeft, daysElapsed: 0, progress: 0, startDate, endDate };
    } else if (now >= startDate && now <= endDate) {
      const timeDiff = now.getTime() - startDate.getTime();
      const daysElapsed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const progress = (daysElapsed / challengeSettings.duration) * 100;
      return { status: 'active', daysLeft: 0, daysElapsed, progress, startDate, endDate };
    } else {
      return { status: 'finished', daysLeft: 0, daysElapsed: challengeSettings.duration, progress: 100, startDate, endDate };
    }
  };

  const challengeStatus = getChallengeStatus();



  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen relative">
      {/* Admin Button */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed top-4 right-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-300 z-40"
      >
        👤 Админ
      </button>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-5xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 uppercase tracking-wide drop-shadow-lg">
            🏆 СПОРТИВНЫЙ ЧЕЛЛЕНДЖ 🏆
          </h1>
          <p className="text-xl text-gray-800">
            2 команды, 2 месяца тренировок, суперфинал <span className="text-purple-600 animate-pulse">и</span> квиз – прокачай себя!
          </p>
          
          {/* Challenge Status */}
          <div className="mt-8">
            {challengeStatus.status === 'not-configured' && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                <p className="text-sm">⚙️ Челлендж еще не настроен. Обратитесь к администратору.</p>
              </div>
            )}

            {challengeStatus.status === 'not-started' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-lg mb-4 text-blue-800 text-center">⏰ До старта осталось:</h3>
                <div className="text-center">
                  <div className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {challengeStatus.daysLeft} {challengeStatus.daysLeft === 1 ? 'день' : challengeStatus.daysLeft < 5 ? 'дня' : 'дней'}
                  </div>
                  <p className="text-sm text-blue-600">
                    Старт: {challengeStatus.startDate?.toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            )}

            {challengeStatus.status === 'active' && (
              <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 border-2 border-emerald-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full animate-float opacity-60"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 bg-emerald-300 rounded-full animate-bounce-slow opacity-50"></div>
                  <div className="absolute bottom-4 left-8 w-4 h-4 bg-cyan-300 rounded-full animate-pulse opacity-70"></div>
                  <div className="absolute bottom-8 right-4 w-5 h-5 bg-purple-300 rounded-full animate-float opacity-60" style={{animationDelay: '2s'}}></div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl mb-6 text-center">
                    <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
                      🔥 ЧЕЛЛЕНДЖ АКТИВЕН! 🔥
                    </span>
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Progress info */}
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <div className="text-lg bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                          День {challengeStatus.daysElapsed + 1}
                        </div>
                        <div className="text-sm text-emerald-600">из {challengeSettings.duration} дней</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                          {Math.round(challengeStatus.progress)}%
                        </div>
                        <div className="text-sm text-emerald-600">завершено</div>
                      </div>
                    </div>

                    {/* Epic Progress Bar */}
                    <div className="relative">
                      {/* Progress bar container with glow effect */}
                      <div className="relative bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full h-8 overflow-hidden shadow-inner border-2 border-gray-300">
                        {/* Animated progress fill */}
                        <div 
                          className="relative h-8 rounded-full transition-all duration-1500 ease-out overflow-hidden"
                          style={{ 
                            width: `${challengeStatus.progress}%`,
                            background: 'linear-gradient(90deg, #10b981, #059669, #047857, #065f46)',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
                          
                          {/* Progress sparkles */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
                            <div className="absolute top-3 left-8 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute top-1.5 right-4 w-1 h-1 bg-cyan-200 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
                          </div>
                        </div>

                        {/* Progress milestones */}
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          {[25, 50, 75].map((milestone) => (
                            <div 
                              key={milestone}
                              className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                                challengeStatus.progress >= milestone 
                                  ? 'bg-yellow-400 border-yellow-600 shadow-lg animate-pulse' 
                                  : 'bg-gray-100 border-gray-400'
                              }`}
                              style={{
                                boxShadow: challengeStatus.progress >= milestone 
                                  ? '0 0 10px rgba(251, 191, 36, 0.8)' 
                                  : 'none'
                              }}
                            >
                              {challengeStatus.progress >= milestone && (
                                <div className="w-full h-full rounded-full bg-yellow-200 animate-ping"></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Progress bar end cap with special effect */}
                        <div 
                          className="absolute top-0 h-8 w-6 bg-gradient-to-r from-transparent to-emerald-400 rounded-r-full transition-all duration-1500 ease-out"
                          style={{ 
                            left: `${Math.max(0, challengeStatus.progress - 3)}%`,
                            opacity: challengeStatus.progress > 3 ? 1 : 0
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-r from-transparent to-white opacity-40 rounded-r-full"></div>
                        </div>
                      </div>

                      {/* Progress labels */}
                      <div className="flex justify-between mt-2 text-xs text-emerald-600">
                        <span>Старт 🚀</span>
                        <span className="bg-emerald-100 px-2 py-1 rounded-full">25% 🌱</span>
                        <span className="bg-emerald-100 px-2 py-1 rounded-full">50% 💪</span>
                        <span className="bg-emerald-100 px-2 py-1 rounded-full">75% 🔥</span>
                        <span>Финиш 🏆</span>
                      </div>
                    </div>

                    {/* Additional info with icons */}
                    <div className="flex justify-center items-center gap-6 pt-4">
                      <div className="text-center">
                        <div className="text-2xl animate-bounce-slow">⚡</div>
                        <div className="text-xs text-emerald-600">Энергия</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl animate-pulse">🎯</div>
                        <div className="text-xs text-emerald-600">Цель</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl animate-float">🏃</div>
                        <div className="text-xs text-emerald-600">Действие</div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <div className="text-sm text-emerald-700 bg-emerald-100 rounded-full px-4 py-2 inline-block">
                        {challengeStatus.endDate && `⏰ Завершение: ${challengeStatus.endDate.toLocaleDateString('ru-RU')}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {challengeStatus.status === 'finished' && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-lg mb-4 text-purple-800 text-center">🎉 Челлендж завершен!</h3>
                <div className="text-center">
                  <div className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {challengeSettings.duration} дней
                  </div>
                  <p className="text-sm text-purple-600">
                    Поздравляем всех участников!
                  </p>
                </div>
              </div>
            )}
          </div>
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

      {/* Analytics Section */}
      <div className="mb-12">
        <Analytics 
          participants={participants}
          teams={teams}
          trackBranches={trackBranches}
        />
      </div>

      {/* Achievements Section */}
      <div className="mb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-8 uppercase text-center">
            🏆 ДОСТИЖЕНИЯ
          </h2>
          
          <div className="relative" onWheel={handleAchievementsWheel}>
            {/* Achievement Cards */}
            <div 
              ref={achievementsGridRef}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 transition-all duration-500 ease-in-out"
            >
              {getCurrentAchievements().map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className={`p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 animate-fade-in ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${achievement.gradient} border-white shadow-2xl` 
                      : 'bg-gray-100 border-gray-300 opacity-60 grayscale'
                  }`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-3 ${achievement.unlocked ? 'animate-bounce-slow' : ''}`}>
                      {achievement.icon}
                    </div>
                    <h4 className={`text-sm mb-2 uppercase tracking-wide ${
                      achievement.unlocked ? 'text-white drop-shadow-lg' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs leading-tight ${
                      achievement.unlocked ? 'text-white/90 drop-shadow' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <div className="mt-3 text-xs bg-white/20 rounded-full px-2 py-1 text-white">
                        ✅ Получено
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slider Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={prevAchievementSlide}
                className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={totalSlides <= 1 || isAnimating}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentAchievementSlide === index 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                    }`}
                    disabled={isAnimating}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextAchievementSlide}
                className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={totalSlides <= 1 || isAnimating}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Achievement Progress */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">
                Прогресс достижений: {achievements.filter(a => a.unlocked).length} из {achievements.length}
              </div>
              <div className="bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                ></div>
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

      {/* Participants Section */}
      <div className="mb-12 mt-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8 uppercase text-center">
            👥 УЧАСТНИКИ ЧЕЛЛЕНДЖА
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {participants.map((participant) => (
              <div key={participant.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center">
                  <h3 className="text-lg mb-4">
                    {participant.firstName} {participant.lastName}
                  </h3>
                  <div className="mb-3">
                    <span className={`${getTrackColor(participant.track)} text-white px-3 py-1 rounded-full text-sm inline-flex items-center gap-1`}>
                      {getTrackEmoji(participant.track)} {participant.track}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs text-white ${
                      participant.team === teams.team1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      👥 {participant.team}
                    </span>
                  </div>
                  <div className="text-2xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-3">
                    {participant.points} баллов
                  </div>
                  
                  {/* Track Points Breakdown */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">📊 По веткам:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {trackBranches.map(branch => {
                        const points = participant.trackPoints[branch] || 0;
                        return (
                          <div key={branch} className="flex justify-between">
                            <span className="text-gray-600 truncate" title={branch}>
                              {branch.length > 8 ? branch.substring(0, 8) + '...' : branch}:
                            </span>
                            <span className={`font-medium ${points > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                              {points}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {participant.achievements.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <div className="mb-1">🏆 Достижения:</div>
                      <div className="flex flex-wrap gap-1">
                        {participant.achievements.slice(0, 2).map((achievement, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            {achievement}
                          </span>
                        ))}
                        {participant.achievements.length > 2 && (
                          <span className="text-gray-500 text-xs">
                            +{participant.achievements.length - 2} ещё
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center mt-12">
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-12 py-4 rounded-full text-xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 animate-pulse border border-white/30"
        >
          🚀 НАЧАТЬ ЧЕЛЛЕНДЖ 🚀
        </button>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-center text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              🏆 РЕГИСТРАЦИЯ НА ЧЕЛЛЕНДЖ
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Имя
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Введите вашу фамилию"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="track" className="block text-sm font-medium text-gray-700">
                  Ветка прокачки
                </label>
                <select
                  id="track"
                  value={formData.track}
                  onChange={(e) => setFormData({...formData, track: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
                  required
                >
                  <option value="">Выберите ветку прокачки</option>
                  <option value="СИЛА">💪 СИЛА</option>
                  <option value="КАРДИО">❤️ КАРДИО</option>
                  <option value="БАЛАНС">🧘 БАЛАНС</option>
                  <option value="АЛЬТЕРНАТИВА">🌟 АЛЬТЕРНАТИВА</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
                >
                  Присоединиться! 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {!isAdminAuthorized ? (
              // Login Form
              <div className="p-8">
                <h2 className="text-center text-2xl bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-6">
                  🔐 ВХОД В АДМИН-ПАНЕЛЬ
                </h2>
                
                {showWrongPasswordImage && (
                  <div className="flex flex-col items-center mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1717827203746-349be791ca2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmFtYSUyMGZyeSUyMHN1c3BpY2lvdXMlMjBzcXVpbnRpbmd8ZW58MXx8fHwxNzU3MTAxNjYyfDA&ixlib=rb-4.1.0&q=80&w=200" 
                      alt="Suspicious Fry"
                      className="w-32 h-32 object-cover rounded-lg shadow-lg mb-2"
                    />
                    <p className="text-red-500 text-sm text-center">Неверный пароль! 🤔</p>
                  </div>
                )}
                
                <form onSubmit={handleAdminLogin} className="space-y-6 max-w-sm mx-auto">
                  <div className="space-y-2">
                    <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                      Пароль
                    </label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Введите пароль"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAdminOpen(false);
                        setShowWrongPasswordImage(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Отмена
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all"
                    >
                      Войти
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Admin Panel
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    ⚙️ АДМИН-ПАНЕЛЬ
                  </h2>
                  <button 
                    onClick={handleAdminLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Закрыть (Logout)
                  </button>
                </div>

                {/* Pending Applications Section */}
                {pendingApplications.length > 0 && (
                  <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h3 className="text-lg mb-4 text-yellow-800">⏳ Очередь на рассмотрение ({pendingApplications.length})</h3>
                    <div className="space-y-3">
                      {pendingApplications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                          <div className="flex-1">
                            <div className="font-medium">{application.firstName} {application.lastName}</div>
                            <div className="text-sm text-gray-600">
                              Ветка: <span className="font-medium">{application.track}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {approvingApplication === application.id ? (
                              <div className="flex gap-2 items-center">
                                <select
                                  value={selectedTeamForApproval}
                                  onChange={(e) => setSelectedTeamForApproval(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                                >
                                  <option value={teams.team1}>{teams.team1}</option>
                                  <option value={teams.team2}>{teams.team2}</option>
                                </select>
                                <button
                                  onClick={handleApproveApplication}
                                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                >
                                  ✓ Подтвердить
                                </button>
                                <button
                                  onClick={handleCancelApproval}
                                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                >
                                  Отмена
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartApproval(application.id)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                >
                                  ✓ Принять
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(application.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                >
                                  ✗ Отклонить
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Track Branches Management */}
                <div className="mb-8 p-6 bg-purple-50 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg">🎯 Ветки прокачки</h3>
                    <button
                      onClick={handleOpenTrackBranches}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Редактировать ветки
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {trackBranches.map((branch, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border-2 border-purple-200">
                        <h4 className="font-medium text-purple-800 text-sm">{branch}</h4>
                        <p className="text-xs text-purple-600 mt-1">
                          Участников: {participants.filter(p => (p.trackPoints[branch] || 0) > 0).length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge Settings */}
                <div className="mb-8 p-6 bg-indigo-50 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg">⏰ Настройки челленджа</h3>
                    <button
                      onClick={handleOpenChallengeSettings}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Настроить челлендж
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                      <h4 className="font-medium text-indigo-800 mb-2">📅 Дата начала</h4>
                      <p className="text-sm text-indigo-600">
                        {challengeSettings.startDate ? 
                          new Date(challengeSettings.startDate).toLocaleDateString('ru-RU') : 
                          'Не установлена'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                      <h4 className="font-medium text-indigo-800 mb-2">⏳ Продолжительность</h4>
                      <p className="text-sm text-indigo-600">
                        {challengeSettings.duration} дней
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border-2 border-indigo-200">
                    <p className="text-sm text-indigo-700">
                      <span className="font-medium">Статус:</span> {
                        challengeStatus.status === 'not-configured' && 'Не настроен' ||
                        challengeStatus.status === 'not-started' && `Старт через ${challengeStatus.daysLeft} дн.` ||
                        challengeStatus.status === 'active' && `Активен (день ${challengeStatus.daysElapsed + 1})` ||
                        challengeStatus.status === 'finished' && 'Завершен'
                      }
                    </p>
                  </div>
                </div>

                {/* Team Management */}
                <div className="mb-8 p-6 bg-blue-50 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg">👥 Управление командами</h3>
                    <button
                      onClick={handleOpenTeamEditor}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Редактировать команды
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">{teams.team1}</h4>
                      <p className="text-sm text-blue-600">
                        Участников: {participants.filter(p => p.team === teams.team1).length}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">{teams.team2}</h4>
                      <p className="text-sm text-blue-600">
                        Участников: {participants.filter(p => p.team === teams.team2).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Participant Form */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg mb-4">➕ Добавить участника</h3>
                  <form onSubmit={handleAddParticipant} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                      <input
                        type="text"
                        value={newParticipantForm.firstName}
                        onChange={(e) => setNewParticipantForm({...newParticipantForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                      <input
                        type="text"
                        value={newParticipantForm.lastName}
                        onChange={(e) => setNewParticipantForm({...newParticipantForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ветка</label>
                      <select
                        value={newParticipantForm.track}
                        onChange={(e) => setNewParticipantForm({...newParticipantForm, track: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Выберите ветку</option>
                        <option value="СИЛА">💪 СИЛА</option>
                        <option value="КАРДИО">❤️ КАРДИО</option>
                        <option value="БАЛАНС">🧘 БАЛАНС</option>
                        <option value="АЛЬТЕРНАТИВА">🌟 АЛЬТЕРНАТИВА</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Добавить
                    </button>
                  </form>
                </div>

                {/* Participants Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Имя</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Фамилия</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ветка</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Команда</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Общие баллы</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Баллы</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Достижения</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant.id} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{participant.id}</td>
                          <td className="px-4 py-3 text-sm">{participant.firstName}</td>
                          <td className="px-4 py-3 text-sm">{participant.lastName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`${getTrackColor(participant.track)} text-white px-2 py-1 rounded-full text-xs inline-flex items-center gap-1`}>
                              {getTrackEmoji(participant.track)} {participant.track}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={participant.team}
                              onChange={(e) => handleChangeParticipantTeam(participant.id, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                            >
                              <option value={teams.team1}>{teams.team1}</option>
                              <option value={teams.team2}>{teams.team2}</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{participant.points}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-1 max-w-xs">
                              {trackBranches.map(branch => (
                                <div key={branch} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{branch}:</span>
                                  <span className="font-medium">{participant.trackPoints[branch] || 0}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="max-w-xs">
                              {participant.achievements.length > 0 
                                ? participant.achievements.join(', ')
                                : '—'
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 items-center">
                              <form onSubmit={handleAdminSubmit} className="flex flex-col gap-2">
                                <input
                                  type="hidden"
                                  value={participant.id}
                                  onChange={(e) => setAdminForm({...adminForm, participantId: e.target.value})}
                                />
                                <div className="flex gap-2">
                                  <select
                                    value={adminForm.participantId === participant.id.toString() ? adminForm.selectedTrackBranch : ''}
                                    onChange={(e) => setAdminForm({
                                      ...adminForm,
                                      participantId: participant.id.toString(),
                                      selectedTrackBranch: e.target.value
                                    })}
                                    className="w-28 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                    required
                                  >
                                    <option value="">Ветка</option>
                                    {trackBranches.map((branch) => (
                                      <option key={branch} value={branch}>
                                        {branch}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="±баллы"
                                    value={adminForm.participantId === participant.id.toString() ? adminForm.points : ''}
                                    onChange={(e) => setAdminForm({
                                      ...adminForm, 
                                      participantId: participant.id.toString(),
                                      points: e.target.value
                                    })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <select
                                    value={adminForm.participantId === participant.id.toString() ? adminForm.achievement : ''}
                                    onChange={(e) => setAdminForm({
                                      ...adminForm,
                                      participantId: participant.id.toString(),
                                      achievement: e.target.value
                                    })}
                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                  >
                                    <option value="">Достижение</option>
                                    {availableAchievements.map((achievement) => (
                                      <option key={achievement.id} value={achievement.title}>
                                        {achievement.title}
                                      </option>
                                    ))}
                                  </select>
                                  <button 
                                    type="submit"
                                    disabled={adminForm.participantId !== participant.id.toString() || !adminForm.points || !adminForm.selectedTrackBranch}
                                    className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Начислить
                                  </button>
                                </div>
                              </form>
                              <button
                                onClick={() => handleDeleteParticipant(participant.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Удалить участника"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Editor Modal */}
      {isTeamEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-center text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              ⚙️ РЕДАКТИРОВАНИЕ КОМАНД
            </h2>
            <form onSubmit={handleSaveTeams} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="team1Name" className="block text-sm font-medium text-gray-700">
                  Название первой команды
                </label>
                <input
                  id="team1Name"
                  type="text"
                  value={editingTeams.team1}
                  onChange={(e) => setEditingTeams({...editingTeams, team1: e.target.value})}
                  placeholder="Введите название первой команды"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="team2Name" className="block text-sm font-medium text-gray-700">
                  Название второй команды
                </label>
                <input
                  id="team2Name"
                  type="text"
                  value={editingTeams.team2}
                  onChange={(e) => setEditingTeams({...editingTeams, team2: e.target.value})}
                  placeholder="Введите название второй команды"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTeamEditorOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenge Settings Modal */}
      {isChallengeSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-center text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              ⏰ НАСТРОЙКИ ЧЕЛЛЕНДЖА
            </h2>
            <form onSubmit={handleSaveChallengeSettings} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Дата начала челленджа
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={editingChallengeSettings.startDate}
                  onChange={(e) => setEditingChallengeSettings({...editingChallengeSettings, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Продолжительность (дни)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="365"
                  value={editingChallengeSettings.duration}
                  onChange={(e) => setEditingChallengeSettings({...editingChallengeSettings, duration: parseInt(e.target.value) || 60})}
                  placeholder="Количество дней"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Предварительный просмотр:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Начало:</span> {
                      editingChallengeSettings.startDate ? 
                        new Date(editingChallengeSettings.startDate).toLocaleDateString('ru-RU') : 
                        'Выберите дату'
                    }
                  </p>
                  <p>
                    <span className="font-medium">Окончание:</span> {
                      editingChallengeSettings.startDate ? 
                        new Date(new Date(editingChallengeSettings.startDate).getTime() + editingChallengeSettings.duration * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU') :
                        'Выберите дату начала'
                    }
                  </p>
                  <p>
                    <span className="font-medium">Продолжительность:</span> {editingChallengeSettings.duration} дней
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsChallengeSettingsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Branches Editor Modal */}
      {isTrackBranchesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-center text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              🎯 РЕДАКТИРОВАНИЕ ВЕТОК ПРОКАЧКИ
            </h2>
            <form onSubmit={handleSaveTrackBranches} className="space-y-6">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {editingTrackBranches.map((branch, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => handleUpdateTrackBranch(index, e.target.value)}
                      placeholder={`Ветка ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTrackBranch(index)}
                      disabled={editingTrackBranches.length <= 1}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Удалить ветку"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleAddTrackBranch}
                className="w-full px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                + Добавить ветку
              </button>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700 mb-2">⚠️ Важно:</h4>
                <div className="text-sm text-purple-600 space-y-1">
                  <p>• Изменение веток повлияет на всех участников</p>
                  <p>• Удаленные ветки будут потеряны навсегда</p>
                  <p>• Новые ветки начнутся с 0 баллов</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTrackBranchesOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeBanner;
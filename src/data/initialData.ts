import {
  AgentDefinition,
  SkillDefinition,
  GlobalRule,
  MemoryItem,
  ErrorRecord,
  TestCase,
  PullRequest,
  ModelRouterConfig,
  TaskRecord,
  TelegramMessage
} from '../types/factory';

export const INITIAL_AGENTS: AgentDefinition[] = [
  {
    id: 'grant_reviewer',
    name: 'GRANT_REVIEWER',
    version: 'v1.0',
    status: 'WARNING',
    role: 'ANALYST',
    mission: 'Глубокий аудит грантовых заявок, проверка на соответствие регламентам фонда, валидация сметы и подтверждение источников.',
    domain: 'Гранты, субсидии, проектное финансирование',
    responsibilities: [
      'Анализ заявки на полноту заполнения',
      'Поиск требований грантооператора и сопоставление критериев',
      'Проверка подтверждающих документов и писем поддержки',
      'Поиск замечаний и рисков отклонения заявки',
      'Проверка достоверности ссылок и первичных источников',
      'Формирование рекомендаций по усилению заявки'
    ],
    capabilities: [
      'Анализ документов заявки (PDF, DOCX, XLSX)',
      'Сверка целей проекта с приоритетами нацпроектов',
      'Проверка реалистичности календарного плана',
      'Верификация обоснованности бюджета'
    ],
    knowledge: [
      'Методические указания Фонда президентских грантов 2026',
      'Регламенты ПФКИ и Минэкономразвития',
      'Требования к софинансированию и подтверждению расходов'
    ],
    skills: ['grant_compliance_check', 'source_verification', 'financial_audit'],
    tools: ['file_analyzer', 'web', 'registry_search', 'pdf_parser'],
    workflow: [
      '1. Идентификация типа фонда и регламента конкурса',
      '2. Парсинг и структурирование заявки',
      '3. Проверка формальных стоп-факторов',
      '4. Анализ качественных критериев (актуальность, масштабируемость)',
      '5. Сверка сметы с коммерческими предложениями',
      '6. Формирование перечня замечаний и итогового балла'
    ],
    decision_rules: [
      'Если отсутствует письмо поддержки ключевого партнера — снижение балла за партнерство на 40%',
      'Если смета содержит нерыночные ставки без 3 КП — выставлять критический флаг',
      'Если цель не соответствует уставной деятельности — блокирующий стоп-фактор'
    ],
    verification: [
      'Проверка актуальности ссылок на публикации в СМИ',
      'Кросс-проверка реквизитов организации в ЕГРЮЛ'
    ],
    memory: ['grant_rubrics_2026', 'common_rejection_causes'],
    restrictions: [
      'Запрет на самостоятельное одобрение заявки с критическими стоп-факторами',
      'Запрет на допущение гипотез без ссылки на источник'
    ],
    escalation_rules: [
      'При расхождении бюджета более чем на 20% эскалировать на ECONOMIST',
      'При юридических противоречиях в уставе эскалировать на LAWYER'
    ],
    test_suite: ['test_grant_01', 'test_grant_02', 'test_grant_03'],
    score: {
      total: 84,
      accuracy: 85,
      completeness: 88,
      reasoning: 82,
      factuality: 76,
      source_quality: 72,
      instruction_following: 92,
      safety: 98,
      efficiency: 90
    },
    known_weaknesses: [
      'Неустойчивая проверка первичных официальных источников',
      'Иногда пропускает скрытые аффилированности поставщиков в сметах'
    ],
    version_history: [
      {
        version: 'v1.0',
        date: '2026-09-18',
        author: 'Master Agent Orchestrator',
        reason: 'Первичная генерация агента по запросу пользователя',
        modified_components: ['initial_agent_manifest', 'workflow_setup'],
        old_score: 0,
        new_score: 84,
        test_pass_rate: 86.6,
        regression_status: 'PASS',
        commit_hash: '9a4c1f2',
        is_active: true
      }
    ],
    learning_history: [
      {
        id: 'LRN-001',
        date: '2026-09-25',
        summary: 'Определен паттерн сокрытия административных расходов в статье "Волонтерские мероприятия"',
        source_task: 'TASK-2026-000014',
        impact: 'Добавлено контрольное правило в чек-лист сметы',
        validated: true
      }
    ],
    metrics: {
      success_rate: 88.4,
      error_rate: 11.6,
      regression_rate: 0,
      average_cost_usd: 0.012,
      average_latency_ms: 1840,
      task_count: 42
    }
  },
  {
    id: 'lawyer',
    name: 'LAWYER',
    version: 'v1.3',
    status: 'HEALTHY',
    role: 'SPECIALIST',
    mission: 'Правовой анализ документов, выявление юридических рисков, проверка нормативно-правовых актов и валидация договоров.',
    domain: 'Российское право, корпоративное и договорное право, регуляторика',
    responsibilities: [
      'Правовая экспертиза договоров и соглашений',
      'Проверка соответствия действующему законодательству РФ',
      'Выявление кабальных и неоднозначных условий',
      'Поиск судебной практики и нормативных актов',
      'Подготовка правовых заключений и правок'
    ],
    capabilities: [
      'Анализ договоров поставки, подряда, лицензий, NDA',
      'Проверка полномочий подписантов',
      'Сверка с арбитражной практикой',
      'Формулирование протоколов разногласий'
    ],
    knowledge: [
      'Гражданский кодекс РФ (ч. 1-4)',
      'ФЗ "О некоммерческих организациях" (7-ФЗ)',
      'ФЗ "О контрактной системе" (44-ФЗ)',
      'Судебная практика Верховного Суда РФ 2024-2026'
    ],
    skills: ['source_verification', 'regulatory_cross_check'],
    tools: ['registry_search', 'legal_database', 'file_analyzer'],
    workflow: [
      '1. Классификация договора и сторон',
      '2. Проверка существенных условий',
      '3. Анализ распределения ответственности и неустоек',
      '4. Проверка сроков и условий расторжения',
      '5. Сверка с последними редакциями законов',
      '6. Заключение с категоризацией рисков (High/Med/Low)'
    ],
    decision_rules: [
      'Односторонний отказ без компенсации — критический риск',
      'Подсудность не по месту нахождения заказчика — средний риск',
      'Отсутствие подтверждения полномочий по доверенности — блокирующий риск'
    ],
    verification: [
      'Обязательная проверка официального опубликования НПА на publication.pravo.gov.ru',
      'Сверка статуса доверенностей в реестре ФНП'
    ],
    memory: ['standard_contract_traps', 'court_case_precedents'],
    restrictions: [
      'Не заменять живую адвокатскую тайну при следственных действиях',
      'Всегда указывать реквизиты конкретных статей законов'
    ],
    escalation_rules: [
      'При уголовно-правовых рисках немедленно уведомить пользователя',
      'При налоговых последствиях передавать задачу на ACCOUNTANT'
    ],
    test_suite: ['test_lawyer_01', 'test_lawyer_02', 'test_lawyer_03', 'test_lawyer_04'],
    score: {
      total: 89,
      accuracy: 94,
      completeness: 88,
      reasoning: 92,
      factuality: 90,
      source_quality: 82,
      instruction_following: 95,
      safety: 96,
      efficiency: 85
    },
    known_weaknesses: [
      'Иногда опирается на формулировки старых редакций подзаконных актов без сверки даты вступления в силу',
      'Требуется усиление в верификации первичных приказов министерств'
    ],
    version_history: [
      {
        version: 'v1.3',
        date: '2026-09-12',
        author: 'Optimizer v1.0',
        reason: 'PR #112: Улучшена проверка полномочий генерального директора',
        modified_components: ['decision_rules', 'workflow'],
        old_score: 85,
        new_score: 89,
        test_pass_rate: 94.0,
        regression_status: 'PASS',
        pr_id: 'PR-112',
        commit_hash: '3f7a2d1',
        is_active: true
      },
      {
        version: 'v1.2',
        date: '2026-08-01',
        author: 'Master Agent',
        reason: 'Добавлена проверка антимонопольных ограничений',
        modified_components: ['workflow'],
        old_score: 80,
        new_score: 85,
        test_pass_rate: 90.0,
        regression_status: 'PASS',
        commit_hash: '1a9b8c7',
        is_active: false
      }
    ],
    learning_history: [
      {
        id: 'LRN-008',
        date: '2026-09-28',
        summary: 'Новая позиция ВС РФ по неустойкам в договорах оказания IT-услуг',
        source_task: 'TASK-2026-000088',
        impact: 'Обновлена база правил оценки соразмерности неустойки',
        validated: true
      }
    ],
    metrics: {
      success_rate: 94.2,
      error_rate: 5.8,
      regression_rate: 0,
      average_cost_usd: 0.015,
      average_latency_ms: 2150,
      task_count: 85
    }
  },
  {
    id: 'accountant',
    name: 'ACCOUNTANT',
    version: 'v1.1',
    status: 'HEALTHY',
    role: 'SPECIALIST',
    mission: 'Бухгалтерский и налоговый аудит, проверка первичных учетных документов, расчет налоговых баз и контроль финансовой дисциплины.',
    domain: 'РСБУ, Налоговый кодекс РФ, первичная документация, кадровый учет',
    responsibilities: [
      'Проверка корректности счетов-фактур, УПД и актов',
      'Контроль соответствия кодов ОКВЭД и налоговых режимов',
      'Проверка арифметической точности смет и калькуляций',
      'Выявление налоговых рисков (ст. 54.1 НК РФ)'
    ],
    capabilities: [
      'Анализ ОСВ и оборотных ведомостей',
      'Сверка НДС и книги покупок',
      'Расчет страховых взносов и НДФЛ по договорам ГПХ',
      'Проверка признания расходов по налогу на прибыль'
    ],
    knowledge: [
      'Налоговый кодекс РФ ч. 1 и 2',
      'ФСБУ 5/2019, ФСБУ 6/2020, ФСБУ 25/2018',
      'Письма Минфина РФ и ФНС 2025-2026'
    ],
    skills: ['financial_audit', 'source_verification'],
    tools: ['file_analyzer', 'tax_calculator', 'registry_search'],
    workflow: [
      '1. Проверка реквизитов контрагента и статуса плательщика НДС',
      '2. Арифметическая сверка итогов',
      '3. Проверка обязательных реквизитов первичного документа (ФЗ 402-ФЗ)',
      '4. Оценка экономического обоснования расхода',
      '5. Формирование рекомендаций по документообороту'
    ],
    decision_rules: [
      'Отсутствие подписи главного бухгалтера при отсутствии приказа — нарушение',
      'Ставка НДС 0% без подтверждающего пакета документов — риск доначисления'
    ],
    verification: [
      'Сверка контрольных соотношений налоговых деклараций',
      'Проверка контрагента по открытым реестрам ФНС'
    ],
    memory: ['tax_scrutiny_criteria', 'frequent_invoice_errors'],
    restrictions: [
      'Не отправлять отчетность в госорганы без явного одобрения пользователя'
    ],
    escalation_rules: [
      'При подозрениях на фиктивный документооборот эскалировать на LAWYER'
    ],
    test_suite: ['test_acc_01', 'test_acc_02'],
    score: {
      total: 92,
      accuracy: 96,
      completeness: 90,
      reasoning: 90,
      factuality: 94,
      source_quality: 91,
      instruction_following: 95,
      safety: 97,
      efficiency: 89
    },
    known_weaknesses: [
      'Требует ручного уточнения специфических отраслевых льгот'
    ],
    version_history: [
      {
        version: 'v1.1',
        date: '2026-08-20',
        author: 'Optimizer',
        reason: 'Обновлены ставки страховых взносов для МСП',
        modified_components: ['knowledge', 'decision_rules'],
        old_score: 87,
        new_score: 92,
        test_pass_rate: 96.0,
        regression_status: 'PASS',
        commit_hash: '2c4d6e8',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 96.1,
      error_rate: 3.9,
      regression_rate: 0,
      average_cost_usd: 0.009,
      average_latency_ms: 1450,
      task_count: 51
    }
  },
  {
    id: 'economist',
    name: 'ECONOMIST',
    version: 'v1.0',
    status: 'HEALTHY',
    role: 'ANALYST',
    mission: 'Финансово-экономическое моделирование, расчет unit-экономики, оценка рентабельности и инвестиционной привлекательности.',
    domain: 'Корпоративные финансы, инвестиционный анализ, сметное планирование',
    responsibilities: [
      'Расчет NPV, IRR, окупаемости (Payback Period)',
      'Проверка гипотез в финансовых моделях',
      'Стресс-тестирование доходной и расходной частей',
      'Оценка макроэкономических допущений (инфляция, курс, ключевая ставка)'
    ],
    capabilities: [
      'Анализ таблиц Excel / CSV финансовых моделей',
      'Анализ безубыточности (Break-even analysis)',
      'Сценарный анализ (Оптимистичный / Базовый / Пессимистичный)'
    ],
    knowledge: [
      'Методология DCF (дисконтированные денежные потоки)',
      'Прогнозы Минэкономразвития и ЦБ РФ на 2026-2028',
      'Стандарты финансового планирования UNIDO'
    ],
    skills: ['financial_audit'],
    tools: ['file_analyzer', 'financial_modeling_sandbox'],
    workflow: [
      '1. Анализ допущений и предпосылок модели',
      '2. Проверка формульной целостности таблицы',
      '3. Расчет ключевых инвестиционных показателей',
      '4. Проведение анализа чувствительности',
      '5. Формирование аналитического резюме'
    ],
    decision_rules: [
      'Ставка дисконтирования ниже ключевой ставки ЦБ считается необоснованной',
      'Если кассовый разрыв прогнозируется более 2 месяцев подряд — критический риск'
    ],
    verification: [
      'Сверка макропрогнозов с актуальным релизом Банка России'
    ],
    memory: ['industry_margin_benchmarks'],
    restrictions: [
      'Не гарантировать доходность инвестиций'
    ],
    escalation_rules: [
      'При расхождениях с налоговым учетом привлекать ACCOUNTANT'
    ],
    test_suite: ['test_econ_01'],
    score: {
      total: 88,
      accuracy: 90,
      completeness: 88,
      reasoning: 92,
      factuality: 86,
      source_quality: 84,
      instruction_following: 92,
      safety: 96,
      efficiency: 88
    },
    known_weaknesses: [
      'Иногда использует среднюю инфляцию вместо таргетированной для специфических отраслей'
    ],
    version_history: [
      {
        version: 'v1.0',
        date: '2026-07-15',
        author: 'Master Agent',
        reason: 'Начальный релиз экономиста',
        modified_components: ['initial_agent_manifest'],
        old_score: 0,
        new_score: 88,
        test_pass_rate: 91.0,
        regression_status: 'PASS',
        commit_hash: '7e8f9a0',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 91.0,
      error_rate: 9.0,
      regression_rate: 0,
      average_cost_usd: 0.011,
      average_latency_ms: 1950,
      task_count: 36
    }
  },
  {
    id: 'ministry',
    name: 'MINISTRY',
    version: 'v1.0',
    status: 'WARNING',
    role: 'SPECIALIST',
    mission: 'Контроль соответствия ведомственным регламентам, приказам профильных министерств и государственным стандартам.',
    domain: 'Государственное управление, административные регламенты, межведомственное взаимодействие',
    responsibilities: [
      'Проверка соответствия приказам Минюста, Минфина, Минцифры, Минэка',
      'Проверка регистрации ведомственных актов в Минюсте РФ',
      'Оценка риска отзыва субсидии или предписания контролирующих органов'
    ],
    capabilities: [
      'Проверка реквизитов государственной регистрации актов',
      'Анализ ведомственных методических писем'
    ],
    knowledge: [
      'Регламенты регистрации НПА в Минюсте РФ (Указ Президента РФ № 763)',
      'Административные регламенты федеральных служб'
    ],
    skills: ['regulatory_cross_check', 'source_verification'],
    tools: ['legal_database', 'registry_search'],
    workflow: [
      '1. Поиск профильного ведомственного нормативного акта',
      '2. Проверка статуса регистрации в Минюсте РФ',
      '3. Анализ действия во времени и по кругу лиц',
      '4. Формирование справки о юридической силе'
    ],
    decision_rules: [
      'Акт ведомства без регистрации в Минюсте не влечет правовых последствий для граждан и юрлиц'
    ],
    verification: [
      'Обязательная сверка регистрационного номера Минюста РФ'
    ],
    memory: ['ministry_circulars_archive'],
    restrictions: [
      'Не применять недействующие приказы'
    ],
    escalation_rules: [
      'При межведомственных коллизиях передавать в REVIEWER и Master Agent'
    ],
    test_suite: ['test_min_01'],
    score: {
      total: 82,
      accuracy: 86,
      completeness: 82,
      reasoning: 85,
      factuality: 78,
      source_quality: 74,
      instruction_following: 90,
      safety: 95,
      efficiency: 84
    },
    known_weaknesses: [
      'Иногда путает методические рекомендации (рекомендательные) с обязательными регламентами'
    ],
    version_history: [
      {
        version: 'v1.0',
        date: '2026-08-10',
        author: 'Master Agent',
        reason: 'Инициализация агента нормативного контроля',
        modified_components: ['initial_agent_manifest'],
        old_score: 0,
        new_score: 82,
        test_pass_rate: 84.0,
        regression_status: 'PASS',
        commit_hash: '5d6e7f8',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 85.0,
      error_rate: 15.0,
      regression_rate: 0,
      average_cost_usd: 0.013,
      average_latency_ms: 1720,
      task_count: 27
    }
  },
  {
    id: 'developer',
    name: 'DEVELOPER',
    version: 'v1.4',
    status: 'HEALTHY',
    role: 'DEVELOPER',
    mission: 'Анализ программного кода, выявление уязвимостей, проектирование системной архитектуры и генерация оптимизированных патчей.',
    domain: 'Software Engineering, TypeScript, Python, Cloud Architecture, Git',
    responsibilities: [
      'Анализ репозиториев и кодовой базы',
      'Поиск ошибок, утечек памяти и security vulnerabilities',
      'Создание тестов и рефакторинг',
      'Подготовка Pull Requests в GitHub'
    ],
    capabilities: [
      'Статический анализ AST',
      'Проектирование API и структур данных',
      'Интеграция с GitHub Actions и CI/CD'
    ],
    knowledge: [
      'TypeScript 5.x, Node.js runtime',
      'REST & GraphQL API design',
      'OWASP Top 10 vulnerabilities'
    ],
    skills: ['code_ast_analysis'],
    tools: ['sandbox_runner', 'github', 'git_cli'],
    workflow: [
      '1. Чтение требований и кода',
      '2. Выявление первопричин багов',
      '3. Написание тестов на воспроизведение',
      '4. Применение точечного патча',
      '5. Прогон тестов на регрессию'
    ],
    decision_rules: [
      'Запрет на использование незащищенных eval/exec',
      'Строгая типизация без any'
    ],
    verification: [
      'Запуск linter и typechecker перед коммитом'
    ],
    memory: ['reusable_arch_patterns'],
    restrictions: [
      'Не коммитить секреты и токены'
    ],
    escalation_rules: [
      'При изменении продакшн-конфигурации запрашивать подтверждение пользователя'
    ],
    test_suite: ['test_dev_01', 'test_dev_02'],
    score: {
      total: 94,
      accuracy: 96,
      completeness: 94,
      reasoning: 95,
      factuality: 96,
      source_quality: 92,
      instruction_following: 97,
      safety: 98,
      efficiency: 92
    },
    known_weaknesses: [
      'Склонен переусложнять абстракции при простых исправлениях'
    ],
    version_history: [
      {
        version: 'v1.4',
        date: '2026-09-30',
        author: 'Developer Evolve Run',
        reason: 'PR #122: Добавлена проверка на prototype pollution',
        modified_components: ['decision_rules', 'workflow'],
        old_score: 90,
        new_score: 94,
        test_pass_rate: 98.0,
        regression_status: 'PASS',
        commit_hash: '4b3c2a1',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 97.2,
      error_rate: 2.8,
      regression_rate: 0,
      average_cost_usd: 0.016,
      average_latency_ms: 2200,
      task_count: 98
    }
  },
  {
    id: 'fact_checker',
    name: 'FACT_CHECKER',
    version: 'v1.2',
    status: 'HEALTHY',
    role: 'FACT_CHECKER',
    mission: 'Кросс-валидация фактических утверждений, поиск первоисточников и выявление галлюцинаций других агентов.',
    domain: 'Верификация фактов, открытые реестры, научные публикации, статистика',
    responsibilities: [
      'Проверка конкретных утверждений на соответствие первичным данным',
      'Поиск цифровых следов документов и цитат',
      'Оценка авторитетности и релевантности источников'
    ],
    capabilities: [
      'Сверка цитат с оригиналами документов',
      'Проверка актуальности статистических данных'
    ],
    knowledge: [
      'Методология OSINT и проверка цифровых источников',
      'Государственные открытые реестры РФ (ЕГРЮЛ, Росстат, Реестр НПА)'
    ],
    skills: ['source_verification'],
    tools: ['web', 'registry_search'],
    workflow: [
      '1. Извлечение проверяемых утверждений (claims)',
      '2. Поиск первичного документа/статистики',
      '3. Сопоставление контекста и цифр',
      '4. Вердикт: Подтверждено / Опровергнуто / Частично / Нет источника'
    ],
    decision_rules: [
      'Утверждение без проверяемого первичного источника не признается фактом'
    ],
    verification: [
      'Прямая ссылка на официальный реестр или первоисточник'
    ],
    memory: ['verified_public_data_sources'],
    restrictions: [
      'Не принимать за первоисточник пересказы в блогах или СМИ'
    ],
    escalation_rules: [
      'При расхождениях более 15% с заявлением эскалировать в REVIEWER'
    ],
    test_suite: ['test_fc_01'],
    score: {
      total: 93,
      accuracy: 97,
      completeness: 89,
      reasoning: 92,
      factuality: 98,
      source_quality: 96,
      instruction_following: 95,
      safety: 98,
      efficiency: 88
    },
    known_weaknesses: [
      'Высокая чувствительность к недоступности внешних реестров'
    ],
    version_history: [
      {
        version: 'v1.2',
        date: '2026-09-05',
        author: 'Master Agent',
        reason: 'PR #108: Добавлены реестры Росстата и Казначейства РФ',
        modified_components: ['knowledge', 'workflow'],
        old_score: 88,
        new_score: 93,
        test_pass_rate: 96.0,
        regression_status: 'PASS',
        commit_hash: '8f9e0a1',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 96.5,
      error_rate: 3.5,
      regression_rate: 0,
      average_cost_usd: 0.010,
      average_latency_ms: 1600,
      task_count: 62
    }
  },
  {
    id: 'reviewer',
    name: 'REVIEWER',
    version: 'v1.1',
    status: 'HEALTHY',
    role: 'REVIEWER',
    mission: 'Синтез ответов команды специализированных агентов, арбитраж противоречий, проверка 8 критериев качества и оформление итогового отчета.',
    domain: 'Мультиагентный синтез, критическая оценка, арбитраж противоречий',
    responsibilities: [
      'Сравнение промежуточных заключений агентов',
      'Выявление и разрешение скрытых противоречий',
      'Проверка соблюдения глобальных правил системы',
      'Формирование единого структурированного ответа пользователю'
    ],
    capabilities: [
      'Детекция логических конфликтов в заключениях',
      'Взвешивание источников по иерархии достоверности',
      'Калькуляция итоговой оценки качества (8 векторов)'
    ],
    knowledge: [
      'Иерархия источников: Первичный источник > Верифицированное знание > Опыт > Память > Допущение модели',
      'Руководство по разрешению конфликтов в мультиагентных системах'
    ],
    skills: ['regulatory_cross_check', 'source_verification'],
    tools: ['synthesis_engine'],
    workflow: [
      '1. Сбор ответов всех назначенных агентов',
      '2. Табличное сопоставление ключевых тезисов',
      '3. Проверка на противоречия',
      '4. При конфликте: запрос верификации у FACT_CHECKER',
      '5. Синтез согласованного отчета для Master Agent'
    ],
    decision_rules: [
      'Если юрист и экономист расходятся в трактовке договора — юрист имеет приоритет в квалификации, экономист в расчете последствий',
      'Любое неустраненное противоречие обязано быть явно показано пользователю'
    ],
    verification: [
      'Проверка каждого вывода на соответствие хотя бы одному заключению специалиста'
    ],
    memory: ['arbitration_rules_archive'],
    restrictions: [
      'Не замалчивать нерешенные разногласия'
    ],
    escalation_rules: [
      'При неустранимом конфликте формулировать запрос на решение человеку'
    ],
    test_suite: ['test_rev_01'],
    score: {
      total: 95,
      accuracy: 96,
      completeness: 95,
      reasoning: 97,
      factuality: 96,
      source_quality: 94,
      instruction_following: 98,
      safety: 99,
      efficiency: 92
    },
    known_weaknesses: [
      'Может требовать больше времени на синтез при 4+ агентах'
    ],
    version_history: [
      {
        version: 'v1.1',
        date: '2026-09-10',
        author: 'Master Agent',
        reason: 'PR #110: Автоматическая детекция скрытых конфликтов в сметах',
        modified_components: ['workflow', 'decision_rules'],
        old_score: 91,
        new_score: 95,
        test_pass_rate: 97.0,
        regression_status: 'PASS',
        commit_hash: '1b2c3d4',
        is_active: true
      }
    ],
    learning_history: [],
    metrics: {
      success_rate: 98.0,
      error_rate: 2.0,
      regression_rate: 0,
      average_cost_usd: 0.014,
      average_latency_ms: 1980,
      task_count: 110
    }
  }
];

export const INITIAL_SKILLS: SkillDefinition[] = [
  {
    skill_id: 'source_verification',
    title: 'Верификация первичных источников',
    purpose: 'Проверка достоверности цитат, ссылок, нормативных актов и статистических утверждений по официальным первичным источникам.',
    input: 'claim (утверждение, ссылка или реквизит документа)',
    workflow: [
      '1. Идентификация фактологического ядра (субъект, действие, число, дата)',
      '2. Определение авторитетного первичного источника (реестр, сайт органа власти, нормативная база)',
      '3. Сопоставление формулировки с оригиналом',
      '4. Оценка актуальности и статуса действия документа',
      '5. Формирование подтвержденного отчета со ссылкой на первоисточник'
    ],
    required_tools: ['web', 'registry_search', 'legal_database'],
    risk: 'medium',
    version: 'v2.1',
    used_by_agents: ['grant_reviewer', 'lawyer', 'accountant', 'ministry', 'fact_checker', 'reviewer'],
    tests_count: 18,
    last_validated: '2026-10-02'
  },
  {
    skill_id: 'regulatory_cross_check',
    title: 'Межотраслевая регуляторная сверка',
    purpose: 'Сверка условий документа с федеральными законами, постановлениями правительства и ведомственными приказами.',
    input: 'document_clauses (пункты договора, регламента или проекта)',
    workflow: [
      '1. Парсинг обязательств и прав сторон',
      '2. Поиск императивных норм законодательства',
      '3. Выявление расхождений и ограничений',
      '4. Оценка юридических и финансовых рисков несоблюдения'
    ],
    required_tools: ['legal_database', 'file_analyzer'],
    risk: 'medium',
    version: 'v1.4',
    used_by_agents: ['lawyer', 'ministry', 'reviewer'],
    tests_count: 12,
    last_validated: '2026-09-29'
  },
  {
    skill_id: 'grant_compliance_check',
    title: 'Аудит грантового соответствия',
    purpose: 'Анализ заявки на соответствие конкретному конкурсному положению и шкале оценки грантооператора.',
    input: 'grant_application_package (текст проекта, смета, приложения)',
    workflow: [
      '1. Определение конкурсного направления и фонда',
      '2. Проверка соответствия целевой группы',
      '3. Оценка критерия информационной открытости',
      '4. Проверка логической цепочки: проблема -> цель -> задачи -> результаты'
    ],
    required_tools: ['file_analyzer', 'registry_search'],
    risk: 'low',
    version: 'v1.2',
    used_by_agents: ['grant_reviewer'],
    tests_count: 15,
    last_validated: '2026-09-27'
  },
  {
    skill_id: 'financial_audit',
    title: 'Аудит смет и финансовой математики',
    purpose: 'Проверка арифметической корректности расчетов, ставок налогов, отчислений и обоснованности статей затрат.',
    input: 'budget_sheet (смета, калькуляция, таблица расходов)',
    workflow: [
      '1. Пересчет всех формул и итоговых сумм',
      '2. Проверка корректности ставок страховых взносов и НДФЛ',
      '3. Сопоставление единиц измерения и рыночной стоимости',
      '4. Формирование ведомости расхождений'
    ],
    required_tools: ['file_analyzer', 'tax_calculator'],
    risk: 'medium',
    version: 'v1.5',
    used_by_agents: ['accountant', 'economist', 'grant_reviewer'],
    tests_count: 14,
    last_validated: '2026-10-01'
  },
  {
    skill_id: 'code_ast_analysis',
    title: 'Анализ абстрактного синтаксического дерева кода',
    purpose: 'Выявление дефектов кодовой базы, архитектурных нарушений и брешей безопасности на уровне AST.',
    input: 'source_files (исходный код приложения)',
    workflow: [
      '1. Построение дерева синтаксиса',
      '2. Проверка правил безопасности и стиля',
      '3. Анализ цикломатической сложности',
      '4. Проверка на утечки секретов и учетных данных'
    ],
    required_tools: ['sandbox_runner', 'git_cli'],
    risk: 'low',
    version: 'v1.3',
    used_by_agents: ['developer'],
    tests_count: 22,
    last_validated: '2026-10-04'
  }
];

export const INITIAL_RULES: GlobalRule[] = [
  {
    rule_id: 'RULE-001',
    title: 'Обязательная проверка первичного источника',
    description: 'При юридических, финансовых, грантовых и нормативных задачах каждый вывод обязан верифицироваться по первичному официальному источнику.',
    reason: 'Предотвращение критических галлюцинаций моделей и отсылок на устаревшие редакции законов и писем.',
    source: 'ERR-2026-0042 (Системный post-mortem юриста и ревьюера)',
    created_from: 'TASK-2026-000042 / LAWYER & MINISTRY',
    confidence: 0.98,
    validated_by: 'USER_APPROVAL (PR #115 merged)',
    affected_agents: ['grant_reviewer', 'lawyer', 'accountant', 'economist', 'ministry', 'fact_checker', 'reviewer'],
    tests: ['test_rule_01', 'test_rule_02'],
    status: 'VALIDATED',
    created_at: '2026-09-15'
  },
  {
    rule_id: 'RULE-002',
    title: 'Запрет на непроверенные числовые допущения',
    description: 'В сметах, расчетах рентабельности и налоговых базах запрещено использовать константы без подтверждения официальной статистикой или КП поставщиков.',
    reason: 'Защита от завышения бюджета грантов и кассовых разрывов в бизнес-планах.',
    source: 'Аудит сметы грантовой заявки в TASK-2026-000067',
    created_from: 'TASK-2026-000067 / ECONOMIST',
    confidence: 0.95,
    validated_by: 'USER_APPROVAL',
    affected_agents: ['grant_reviewer', 'accountant', 'economist'],
    tests: ['test_rule_03'],
    status: 'VALIDATED',
    created_at: '2026-09-22'
  },
  {
    rule_id: 'RULE-003',
    title: 'Явная фиксация неустранимых противоречий',
    description: 'Если между заключениями специализированных агентов сохраняется коллизия, система обязана явно отобразить позиции сторон в финальном отчете без случайного выбора.',
    reason: 'Исключение маскировки правовой неопределенности перед пользователем.',
    source: 'Разногласие между LAWYER и MINISTRY по статусу ведомственного приказа',
    created_from: 'TASK-2026-000078 / REVIEWER',
    confidence: 0.96,
    validated_by: 'USER_APPROVAL',
    affected_agents: ['reviewer'],
    tests: ['test_rule_04'],
    status: 'VALIDATED',
    created_at: '2026-09-28'
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'MEM-USR-01',
    layer: 'USER_MEMORY',
    title: 'Предпочтения пользователя по стилю отчетов',
    content: 'Пользователь предпочитает лаконичные структурированные ответы с разделением на: 1. Ключевой вывод; 2. Выявленные риски; 3. Рекомендованные формулировки.',
    provenance: {
      knowledge_id: 'KN-USR-001',
      source: 'Telegram directive from user (chat_id: 84920194)',
      source_type: 'USER_DIRECTIVE',
      date: '2026-09-10',
      created_by: 'User Command',
      confidence: 1.0,
      verified: true,
      verification_method: 'Direct user instruction',
      used_by: ['grant_reviewer', 'lawyer', 'reviewer']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-10'
  },
  {
    id: 'MEM-AGT-01',
    layer: 'AGENT_MEMORY',
    title: 'Паттерн оценки грантов: софинансирование',
    content: 'Фонд президентских грантов не засчитывает софинансирование без приложенных писем поддержки с конкретными суммами или перечнем безвозмездных услуг.',
    agent_id: 'grant_reviewer',
    provenance: {
      knowledge_id: 'KN-FPG-2026-01',
      source: 'Методические рекомендации ФПГ 2026, раздел 4.2',
      source_type: 'PRIMARY_SOURCE',
      date: '2026-09-18',
      created_by: 'grant_reviewer analysis',
      confidence: 0.96,
      verified: true,
      verification_method: 'Official fund document cross-check',
      used_by: ['grant_reviewer']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-18'
  },
  {
    id: 'MEM-GLB-01',
    layer: 'GLOBAL_MEMORY',
    title: 'Единый реестр официальных правовых актов РФ',
    content: 'Официальным источником опубликования федеральных законов и актов является pravo.gov.ru, а также "Российская газета" и "Парламентская газета".',
    provenance: {
      knowledge_id: 'KN-PRAVO-01',
      source: 'ФЗ "О порядке опубликования и вступления в силу федеральных законов"',
      source_type: 'PRIMARY_SOURCE',
      date: '2026-09-01',
      created_by: 'System bootstrapping',
      confidence: 1.0,
      verified: true,
      verification_method: 'Statutory basis',
      used_by: ['lawyer', 'ministry', 'fact_checker']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-01'
  },
  {
    id: 'MEM-ERR-01',
    layer: 'ERROR_MEMORY',
    title: 'Повторяющаяся ошибка: пропуск сверки даты вступления закона в силу',
    content: 'Зафиксировано 3 случая, когда агенты ссылались на закон, принятый Госдумой, но вступающий в силу только с 1 января следующего года.',
    provenance: {
      knowledge_id: 'KN-ERR-0042',
      source: 'ERR-2026-0042 Post-Mortem',
      source_type: 'AUTO_SYNTHESIS',
      date: '2026-09-24',
      created_by: 'Error Engine RCA',
      confidence: 0.99,
      verified: true,
      verification_method: 'Meta-learning error frequency clustering',
      used_by: ['lawyer', 'ministry']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-24'
  },
  {
    id: 'MEM-PAT-01',
    layer: 'PATTERN_MEMORY',
    title: 'Оптимальный пайплайн проверки грантовой заявки',
    content: 'Последовательность: File Analyzer -> Lawyer (устав и форма) -> Ministry (отраслевые нормы) -> Economist (смета) -> Fact Checker (источники) -> Reviewer (синтез) показывает наивысшую точность (94/100).',
    provenance: {
      knowledge_id: 'KN-PAT-009',
      source: 'Evolve Benchmarking Run #4',
      source_type: 'EXPERIENCE',
      date: '2026-09-28',
      created_by: 'Optimizer benchmark engine',
      confidence: 0.94,
      verified: true,
      verification_method: '30 regression test runs comparison',
      used_by: ['grant_reviewer', 'reviewer']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-28'
  },
  {
    id: 'MEM-RUL-01',
    layer: 'RULE_MEMORY',
    title: 'Каталог подтвержденных правил безопасности',
    content: 'Все внешние действия, изменение прав, публикация релизов в прод и сброс долговременной памяти требуют строгого подтверждения человека (Human-in-the-Loop).',
    provenance: {
      knowledge_id: 'KN-RUL-001',
      source: 'Системная конституция AI OS v1.0',
      source_type: 'USER_DIRECTIVE',
      date: '2026-09-01',
      created_by: 'Security Kernel',
      confidence: 1.0,
      verified: true,
      verification_method: 'Architectural constraint',
      used_by: ['master_agent', 'orchestrator']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-01'
  },
  {
    id: 'MEM-TST-01',
    layer: 'TEST_MEMORY',
    title: 'Золотой датасет регрессионных тестов грантовых заявок',
    content: '30 канонических сценариев с заведомо заложенными дефектами: фиктивное письмо поддержки, завышенная смета, непроверенная ссылка на СМИ, кассационное определение.',
    provenance: {
      knowledge_id: 'KN-TST-GOLDEN-01',
      source: 'Test Engine Golden Suite',
      source_type: 'EXPERIENCE',
      date: '2026-09-20',
      created_by: 'Test Engine',
      confidence: 0.98,
      verified: true,
      verification_method: 'Manual verification against past grants',
      used_by: ['grant_reviewer']
    },
    status: 'VALIDATED',
    updated_at: '2026-09-20'
  }
];

export const INITIAL_ERRORS: ErrorRecord[] = [
  {
    error_id: 'ERR-2026-0042',
    agent_id: 'lawyer',
    task_id: 'TASK-2026-000042',
    timestamp: '2026-09-24 14:32:10',
    description: 'Агент LAWYER не проверил официальный статус ведомственного приказа Минюста РФ и применил проект документа.',
    expected: 'Обязательная проверка номера государственной регистрации в Минюсте РФ и даты вступления в силу.',
    actual: 'Агент процитировал текст проекта приказа с regulation.gov.ru как действующий закон.',
    symptom: 'Агент не проверил официальный источник.',
    intermediate_cause: 'Проверка государственной регистрации отсутствовала в обязательном чеклисте workflow.',
    root_cause: 'Архитектура агента не делала этап verification блокирующим гейтом перед генерацией вывода.',
    severity: 'high',
    proposed_fix: 'Внедрить навык source_verification и заблокировать генерацию правового заключения без подтвержденного регистрационного номера Минюста.',
    affected_skill: 'source_verification',
    affected_rule: 'RULE-001',
    tests_required: ['test_lawyer_source_01', 'test_lawyer_source_02'],
    status: 'fixed'
  },
  {
    error_id: 'ERR-2026-0051',
    agent_id: 'grant_reviewer',
    task_id: 'TASK-2026-000051',
    timestamp: '2026-09-29 11:15:40',
    description: 'GRANT_REVIEWER пропустил недействующую ссылку на статью в региональном СМИ в разделе "Информационная открытость".',
    expected: 'Переход по ссылке, фиксация HTTP 404 и выставление замечания с вычетом баллов.',
    actual: 'Агент зачел наличие ссылки формально по совпадению регулярного выражения URL.',
    symptom: 'Битые ссылки не выявляются при анализе заявки.',
    intermediate_cause: 'Инструмент web search не запускался для валидации внешних гиперссылок заявки.',
    root_cause: 'В манифесте агента отсутствовало требование обязательного пинга внешних ссылок перед выставлением оценки.',
    severity: 'medium',
    proposed_fix: 'Добавить в GRANT_REVIEWER обязательный подпроцесс ping_external_sources и обновить test suite.',
    affected_skill: 'grant_compliance_check',
    tests_required: ['test_grant_broken_url'],
    status: 'open'
  }
];

export const INITIAL_TESTS: TestCase[] = [
  {
    id: 'test_grant_01',
    agent_id: 'grant_reviewer',
    name: 'Базовый аудит гранта на культуру',
    type: 'BASIC',
    prompt: 'Проверь проект "Театр в малых городах" с бюджетом 2.5 млн руб. Требование: софинансирование 30%.',
    expected_output_criteria: [
      'Проверка наличия писем софинансирования на сумму не менее 750 тыс. руб.',
      'Оценка актуальности и целевой аудитории',
      'Формирование корректного перечня замечаний'
    ],
    critical: true,
    last_run_status: 'PASS',
    last_run_date: '2026-10-04 18:20',
    execution_time_ms: 1820,
    score: 92
  },
  {
    id: 'test_grant_02',
    agent_id: 'grant_reviewer',
    name: 'Выявление битых ссылок и неподтвержденных источников',
    type: 'SOURCE',
    prompt: 'Заявка содержит 5 ссылок на публикации, из которых 2 отдают 404, а 1 ведет на нерелевантный форум.',
    expected_output_criteria: [
      'Детекция двух неработающих ссылок',
      'Снижение балла за информационную открытость',
      'Рекомендация приложить архивные копии или PDF публикаций'
    ],
    critical: true,
    last_run_status: 'FAIL',
    last_run_date: '2026-10-04 18:22',
    execution_time_ms: 2100,
    score: 68
  },
  {
    id: 'test_grant_03',
    agent_id: 'grant_reviewer',
    name: 'Атака сокрытием аффилированности поставщика',
    type: 'ADVERSARIAL',
    prompt: 'Смета содержит закупку оборудования у ИП "Иванов И.И.", где учредитель НКО является тем же лицом.',
    expected_output_criteria: [
      'Идентификация конфликта интересов',
      'Выставление критического флага нарушения антикоррупционных правил фонда',
      'Требование альтернативных 3 коммерческих предложений'
    ],
    critical: true,
    last_run_status: 'PASS',
    last_run_date: '2026-10-04 18:25',
    execution_time_ms: 1950,
    score: 94
  },
  {
    id: 'test_lawyer_01',
    agent_id: 'lawyer',
    name: 'Анализ договора поставки с кабальной неустойкой',
    type: 'COMPLEX',
    prompt: 'Договор поставки содержит пункт: "Неустойка за каждый день просрочки 5% от общей суммы договора".',
    expected_output_criteria: [
      'Квалификация неустойки как явно несоразмерной (ст. 333 ГК РФ)',
      'Ссылка на разъяснения Пленума ВС РФ № 7',
      'Предложение снижения ставки до 0.1% или ключевой ставки ЦБ'
    ],
    critical: true,
    last_run_status: 'PASS',
    last_run_date: '2026-10-03 14:10',
    execution_time_ms: 1650,
    score: 96
  },
  {
    id: 'test_lawyer_02',
    agent_id: 'lawyer',
    name: 'Проверка ссылки на невступивший в силу закон',
    type: 'SOURCE',
    prompt: 'Оппонент ссылается на закон "О цифровых финансовых активах", требуя лицензию по еще не вступившей в силу статье.',
    expected_output_criteria: [
      'Проверка даты вступления статьи в силу по pravo.gov.ru',
      'Фиксация отсутствия обязанности исполнения до наступления указанной даты',
      'Правовая защита позиции пользователя'
    ],
    critical: true,
    last_run_status: 'PASS',
    last_run_date: '2026-10-03 14:12',
    execution_time_ms: 1780,
    score: 95
  }
];

export const INITIAL_PULL_REQUESTS: PullRequest[] = [
  {
    id: 'PR-127',
    pr_number: 127,
    agent_id: 'grant_reviewer',
    title: 'Усиление проверки первичных источников и внешних ссылок в GRANT_REVIEWER',
    current_version: 'v1.0',
    candidate_version: 'v1.1',
    current_score: 84,
    candidate_score: 92,
    regression_status: 'PASS',
    critical_failures_count: 0,
    description: `### Описание изменений
- Добавлен обязательный шаг валидации внешних гиперссылок перед подсчетом балла за открытость
- Интегрирован навык \`source_verification\` v2.1
- Добавлено правило обнаружения скрытых аффилированностей в сметах
- Пройден полный регрессионный набор из 30 тестов

### Результаты тестирования
- Старый балл: 84/100
- Балл кандидата: 92/100 (+8 пунктов)
- Регрессионные ошибки: 0
- Критические сбои: 0

**Требуется одобрение пользователя для релиза.**`,
    status: 'OPEN_AWAITING_APPROVAL',
    diff_summary: {
      added_skills: ['source_verification'],
      modified_rules: ['RULE-001', 'RULE-002'],
      workflow_changes: [
        '+ Добавлен этап 3.1: Пинг и кросс-проверка всех внешних ссылок и СМИ',
        '+ Добавлен этап 5.2: Сверка ИНН поставщиков в смете с ЕГРЮЛ'
      ],
      verification_steps_added: [
        'Валидация HTTP статуса публикаций проекта',
        'Проверка актуальности выписки ЕГРЮЛ контрагента'
      ]
    },
    created_at: '2026-10-05 16:30'
  }
];

export const INITIAL_MODEL_CONFIG: ModelRouterConfig = {
  provider: 'openrouter',
  default_model: 'gemini-3.8-flash',
  research_model: 'gemini-3.8-flash',
  coding_model: 'gemini-3.8-flash',
  reasoning_model: 'gemini-3.8-flash',
  fallback_models: ['gemini-3.1-flash-lite'],
  max_cost_per_task: 0.25,
  max_cost_per_day: 5.0,
  max_tokens_per_task: 32000,
  temperature: 0.3,
  daily_cost_current: 0.34
};

export const INITIAL_TASKS: TaskRecord[] = [
  {
    task_id: 'TASK-2026-000104',
    user_input: 'Проверь грантовую заявку проекта "Молодежная IT-лаборатория" на 3.8 млн руб.',
    task_type: 'TASK',
    status: 'COMPLETED',
    created_at: '2026-10-05 19:40:12',
    completed_at: '2026-10-05 19:40:48',
    assigned_agents: ['grant_reviewer', 'lawyer', 'economist', 'fact_checker', 'reviewer'],
    pipeline_steps: [
      { step_name: 'Анализ документа', agent_id: 'grant_reviewer', status: 'done' },
      { step_name: 'Проверка требований фонда', agent_id: 'grant_reviewer', status: 'done' },
      { step_name: 'Юридическая проверка устава и писем', agent_id: 'lawyer', status: 'done' },
      { step_name: 'Аудит сметы и ставок', agent_id: 'economist', status: 'done' },
      { step_name: 'Проверка первичных источников', agent_id: 'fact_checker', status: 'done' },
      { step_name: 'Финальная оценка и арбитраж', agent_id: 'reviewer', status: 'done' }
    ],
    sub_tasks: [
      {
        id: 'sub-01',
        agent_id: 'grant_reviewer',
        agent_name: 'GRANT_REVIEWER',
        role: 'Анализ конкурсной заявки',
        status: 'completed',
        output: 'Заявка оформлена по форме ФПГ. Софинансирование заявлено на уровне 28% (требуется 30%). Не хватает 76 000 руб. до нормы.',
        identified_issues: ['Дефицит софинансирования на 76 000 руб.', 'Целевая группа описана абстрактно'],
        confidence: 0.92,
        duration_ms: 1200
      },
      {
        id: 'sub-02',
        agent_id: 'lawyer',
        agent_name: 'LAWYER',
        role: 'Правовая экспертиза документов',
        status: 'completed',
        output: 'Устав НКО позволяет осуществлять образовательно-просветительскую деятельность. Полномочия руководителя подтверждены действующим протоколом.',
        sources_checked: ['ЕГРЮЛ', 'Устав НКО от 2023 г.'],
        confidence: 0.98,
        duration_ms: 980
      },
      {
        id: 'sub-03',
        agent_id: 'economist',
        agent_name: 'ECONOMIST',
        role: 'Финансовый аудит сметы',
        status: 'completed',
        output: 'Ставки оплаты труда наставников соответствуют среднерыночным (65 000 руб./мес). Страховые взносы рассчитаны верно по льготной ставке 7.6% для НКО.',
        confidence: 0.95,
        duration_ms: 1100
      },
      {
        id: 'sub-04',
        agent_id: 'fact_checker',
        agent_name: 'FACT_CHECKER',
        role: 'Верификация ссылок и цитат',
        status: 'completed',
        output: 'Ссылка на письмо поддержки Минцифры региона подтверждена. Однако ссылка на публикацию в сетевом издании "Инновации" возвращает 404.',
        identified_issues: ['Неработающая ссылка на СМИ (HTTP 404)'],
        sources_checked: ['Сайт Минцифры региона', 'Архив публикаций'],
        confidence: 0.97,
        duration_ms: 850
      },
      {
        id: 'sub-05',
        agent_id: 'reviewer',
        agent_name: 'REVIEWER',
        role: 'Синтез и арбитраж',
        status: 'completed',
        output: 'Сводное заключение готово. Первичный балл: 86/100. Рекомендовано добрать софинансирование на 76 000 руб. и заменить битую ссылку на скан публикации.',
        confidence: 0.96,
        duration_ms: 920
      }
    ],
    contradictions_found: [],
    final_result: `✅ ЗАДАЧА ЗАВЕРШЕНА

Agent: GRANT_REVIEWER (совместно с LAWYER, ECONOMIST, FACT_CHECKER, REVIEWER)
Version: 1.0

Общий балл заявки: 86/100

Найдено замечаний:
1. Дефицит софинансирования: заявлено 28% (1 064 000 руб.) вместо регламентных 30% (не хватает 76 000 руб.).
2. Неработающая гиперссылка (HTTP 404) на публикацию о предыдущем опыте в СМИ.

Рекомендации по усилению:
1. Добавить безвозмездное предоставление помещения партнером на 80 000 руб. по гарантийному письму.
2. Заменить битую веб-ссылку сканированным PDF-материалом с реквизитами номера издания.

Юридическая чистота: 98/100 (рисков отклонения по форме нет).
Финансовая обоснованность: 92/100 (ставки рыночные, налоги рассчитаны корректно).`,
    evaluation: {
      accuracy: 94,
      completeness: 92,
      reasoning: 93,
      factuality: 96,
      source_quality: 91,
      instruction_following: 98,
      safety: 99,
      efficiency: 94,
      total_score: 93.8,
      critical_failures: [],
      recommendations: [
        'Внедрить автоматический ping ссылок в манифест агента',
        'Создать автотест на процент софинансирования'
      ]
    },
    tokens_used: 4850,
    cost_usd: 0.0073,
    model_used: 'gemini-3.8-flash'
  }
];

export const INITIAL_TELEGRAM_MESSAGES: TelegramMessage[] = [
  {
    id: 'msg-01',
    sender: 'user',
    text: '/start',
    timestamp: '2026-10-05 19:35:00'
  },
  {
    id: 'msg-02',
    sender: 'bot',
    text: `🧠 PERSONAL AI AGENT FACTORY // AI OS v1.0

Добро пожаловать в персональную фабрику AI-агентов.
Центральный репозиторий: GitHub
Среда исполнения: GitHub Actions & Master Agent
Шлюз моделей: OpenRouter / Gemini AI Gateway

Доступные команды:
/status — Текущее состояние ядра и метрик
/agents — Каталог и рейтинги агентов
/tasks — История задач и пайплайнов
/improve [agent] — Запуск цикла оптимизации
/test [agent] — Запуск тестового набора
/evolve [agent] — Полный автономный цикл эволюции
/rollback [agent] [ver] — Откат на проверенную версию
/memory — 7-уровневая матрица знаний
/errors — Анализ первопричин (Root Cause)
/learn [правило] — Фиксация подтвержденного знания

Или просто напишите задачу на естественном языке.`,
    timestamp: '2026-10-05 19:35:02',
    buttons: [
      { label: '📊 Статус системы', action: '/status' },
      { label: '🤖 Агенты (7)', action: '/agents' },
      { label: '🧬 Эволюция', action: '/evolve grant_reviewer' },
      { label: '🧠 Память', action: '/memory' }
    ]
  },
  {
    id: 'msg-03',
    sender: 'user',
    text: 'Проверь грантовую заявку проекта "Молодежная IT-лаборатория" на 3.8 млн руб.',
    timestamp: '2026-10-05 19:40:12',
    attached_file: {
      name: 'grant_application_it_lab_2026.pdf',
      size: '2.4 MB',
      type: 'application/pdf'
    }
  },
  {
    id: 'msg-04',
    sender: 'bot',
    text: '🧠 AGENT FACTORY // Задача принята в обработку\nID: TASK-2026-000104\nДиспетчер назначил: GRANT_REVIEWER, LAWYER, ECONOMIST, FACT_CHECKER, REVIEWER',
    timestamp: '2026-10-05 19:40:14',
    task_id: 'TASK-2026-000104',
    progress_card: {
      task_name: 'Проверка гранта: Молодежная IT-лаборатория',
      status: 'Выполняется',
      steps: [
        { name: 'Анализ документа', status: 'done' },
        { name: 'Проверка требований фонда', status: 'done' },
        { name: 'Юридическая проверка устава', status: 'done' },
        { name: 'Аудит сметы и ставок', status: 'done' },
        { name: 'Проверка первичных источников', status: 'done' },
        { name: 'Финальная оценка и арбитраж', status: 'done' }
      ]
    }
  },
  {
    id: 'msg-05',
    sender: 'bot',
    text: `✅ ЗАДАЧА ЗАВЕРШЕНА

Agent: GRANT_REVIEWER
Version: 1.0

Score: 86/100

Найдено:
2 критических замечания
3 практические рекомендации

Софинансирование: 28% (дефицит 76 000 руб. до 30%)
Ссылки: найдена 1 неработающая веб-ссылка на СМИ

Регрессионный статус: PASS`,
    timestamp: '2026-10-05 19:40:48',
    task_id: 'TASK-2026-000104',
    completion_card: {
      agent_name: 'GRANT_REVIEWER',
      version: '1.0',
      score: 86,
      findings_count: 2,
      recommendations_count: 3,
      regression_status: 'PASS'
    },
    buttons: [
      { label: '🧬 Улучшить агента (/improve)', action: '/improve grant_reviewer', variant: 'primary' },
      { label: '🧪 Запустить тесты (/test)', action: '/test grant_reviewer' },
      { label: '📄 Детальный отчет', action: '/report TASK-2026-000104' }
    ]
  }
];

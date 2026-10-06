/* Transparent, device-local text clues. No AI calls or pronunciation claims. */
(() => {
  const R = (pattern, en, zh, suggestion) => ({pattern, label:{en,'zh-CN':zh}, suggestion});
  const name = R(/\b(my name is|i am|i'm|call me)\b/i,'A name introduction','姓名介绍','My name is ___. Please call me ___.');
  const greeting = R(/\b(hi|hello|nice|pleasure|thanks?|meet|of course|certainly|sure)\b/i,'A greeting or acknowledgement','问候或回应','Hi, it’s nice to meet you.');
  const reason = R(/\b(because|so|helps?|important|want|learn)\b/i,'A reason or purpose marker','原因或目的表达','This matters to me because ___.');
  const example = R(/\b(for example|in one|project|class|once|when|event|at first|presentation)\b/i,'A situation or example marker','情境或例子表达','For example, in one class, I ___.');
  const action = R(/\b(i|we)\s+(would|will|can|could|helped|checked|practiced|practised|organized|lear[nm]ed|asked)/i,'An action stated with a subject','明确主语和行动','First, I would ___. Then, I would ___.');
  const ask = R(/\b(ask|could|would|can|may|please|let me check)\b/i,'A request or checking phrase','询问或核对表达','Could you help me check ___, please?');
  const help = R(/\b(supervisor|manager|support|help|guidance|training)\b/i,'A source of help','求助对象或支持','I would ask my supervisor for help.');
  const manual = R(null,'Truth and appropriateness need your own review','真实性与情境是否合适，需要自己核对','Use your own facts, and compare your meaning with the situation.');
  const rules = [
    [name,greeting,R(s=>s.split(/\s+/).length<=45,'An opening of 45 words or fewer','开场不超过 45 词','Keep the opening to a few clear sentences.')],
    [R(/\b(last name|family name|surname)\b/i,'A family-name introduction','说明姓氏','My last name is ___.'),R(/\b(?:[a-z][-\s]){2,}[a-z]\b/i,'Separated written letters','逐个分开的字母','That’s spelled A-B-C.'),R(/\b(again|repeat)\b/i,'An offer to repeat','愿意重复','Would you like me to spell it again?')],
    [R(/\b(nine fifteen|9[:.]15)\b/i,'Nine fifteen','九点十五分','My shift starts at nine fifteen.'),R(/\btomorrow\b/i,'Tomorrow','明天','My shift starts tomorrow.'),R(/\b(morning|evening|a\.?m\.?|p\.?m\.?)\b/i,'Morning or evening detail','上午或下午信息','Do you mean in the morning?')],
    [R(/\b(cups?|register)\b/i,'The understood instruction','已经听懂的指令','I understand that the cups go beside the register.'),R(/\b(repeat|clarify|what|where)\b/i,'A specific clarification request','具体澄清问题','Could you repeat what I should do with the tray?'),manual],
    [R(/\btuesday\b/i,'Tuesday','周二','I’m available on Tuesday.'),R(/\bthursday\b/i,'Thursday','周四','I’m not available on Thursday.'),R(/\b(but|not|cannot|can't|unavailable)\b/i,'A contrast or negative','转折或否定表达','I’m available on Tuesday, but not on Thursday.')],
    [R(/\b(study|studying|student|major|university|college)\b/i,'Current studies','目前学习情况','I’m studying ___ at ___.'),R(/\b(enjoy|interest|like|project)\b/i,'An interest or relevant detail','兴趣或相关细节','I especially enjoy ___.'),manual],
    [R(/\b(enjoy|like|favorite|favourite|prefer)\b/i,'A preference','学习偏好','I enjoy ___.'),reason,example],
    [R(/\b(morning|after|evening|first|then)\b/i,'Sequence words','顺序表达','In the morning, I ___. After that, I ___.'),R(/\b(attend|study|work|meet|exercise|prepare|go|have|read)\b/i,'Routine-action vocabulary','日常行动词','I attend classes and work on assignments.'),manual],
    [R(/\b(enjoy|like|interest|hobby|prefer)\b/i,'A named interest','兴趣表达','I enjoy ___.'),reason,manual],
    [example,action,R(/\b(after|result|learned|learnt|could|able|improved)\b/i,'A result or change marker','结果或变化表达','After practicing, I could ___.')],
    [R(/\b(want|hope|goal|interested)\b/i,'A goal or reason','目标或动机','I want to ___.'),R(/\b(everyday|work|people|team|situations|coworker)\b/i,'A practical connection','实际情境连接','For example, I want to communicate with coworkers.'),manual],
    [R(/\b(learn|hope|curious|understand)\b/i,'Something to learn','想学的内容','I hope to learn how people ___.'),R(/\b(join|ask|talk|visit|explore|participate)\b/i,'A way to explore','了解方式','I would join local activities and ask questions.'),R(/\b(everyday|work|daily|life|coworker)\b/i,'Everyday-life connection','日常生活连接','I want to understand everyday life at work.')],
    [R(/\b(prefer|role|job|work|position)\b/i,'A role or preference','岗位或偏好','I would prefer ___.'),R(/\b(patient|strength|skill|good at|help|team|experience)\b/i,'A strength-related clue','能力相关线索','One strength I can show is ___.'),R(/\b(learn|willing|flexible|training)\b/i,'Willingness to learn','学习意愿','I am willing to learn new tasks.')],
    [R(/\b(dish|food|family|celebration|festival|music|tradition|campus)\b/i,'A concrete cultural example','具体文化例子','I could share a dish my family makes.'),manual,R(/\b(ask|them|their|coworker|also)\b/i,'A two-way exchange clue','双向交流线索','I would ask what is important to them, too.')],
    [R(/\b(miss|homesick|difficult|challenge|struggle)\b/i,'Acknowledging a challenge','承认挑战','I may miss my family.'),R(/\b(routine|call|schedule|connect|exercise)\b/i,'A practical coping step','具体应对行动','I would keep a routine and arrange time to call home.'),help],
    [example,R(/\b(responsible|responsibility|my role|i was|i had)\b/i,'Your responsibility','自己的责任','I was responsible for ___.'),R(/\b(finish|finished|helped|checked|result|on time|completed)\b/i,'An action or outcome','行动或结果','I checked ___, and we finished on time.')],
    [R(/\b(safety|priority|urgent|waiting|compare)\b/i,'A priority criterion','判断优先级的依据','I would check whether either task affects safety.'),help,action],
    [R(/\b(mistake|acknowledge|responsibility|sorry|admit)\b/i,'Acknowledging the mistake','承认错误','I would acknowledge the mistake.'),help,R(/\b(correct|learn|repeat|note|prevent|again)\b/i,'Correction or learning','改正或学习','I would ask how to correct it and make a note.')],
    [R(/\b(demonstration|instruction|show|watch|ask|training)\b/i,'Requesting instruction','请求指导','I would ask for a demonstration.'),R(/\b(repeat|check|back|understand|confirm)\b/i,'Checking understanding','确认理解','I would repeat the main instructions back.'),manual],
    [R(/\b(could|what|how|when|where|would|can)\b/i,'A question opening','提问开头','Could you tell me ___?'),R(/\b(training|week|role|team|successful|responsibilities)\b/i,'A job-specific detail','岗位具体细节','What training would I receive in my first week?'),manual],
    [R(/\bcoffee\b/i,'Coffee','咖啡','That’s a coffee, correct?'),R(/\bsmall\b.*\boat milk\b|\boat milk\b.*\bsmall\b/i,'Small size and oat milk','小杯与燕麦奶','A small coffee with oat milk.'),R(/\b(anything else|other|another)\b/i,'Checking for anything else','询问其他需求','Would you like anything else with your order?')],
    [R(/\b(not sure|don't know|do not know|check|confirm)\b/i,'Uncertainty or a check','不确定或核对表达','I’m not sure, so I will check.'),R(/\b(ingredient|information|kitchen|supervisor)\b/i,'An information source','信息来源','I’ll check the ingredient information with the kitchen.'),R(/\b(wait|while|back|update|confirm)\b/i,'A next step','下一步','Please wait while I confirm it.')],
    [R(/\b(sorry|apologize|apologise)\b/i,'An apology','道歉','I’m sorry about the mix-up.'),R(/\b(order|drink|tea|mix-up|mistake|problem)\b/i,'The order problem','订单问题','Let me check your order.'),R(/\b(check|arrange|correct|replace|bring)\b/i,'A practical action','实际行动','I’ll arrange the correct drink.')],
    [R(/\b(ten|10)\s+minutes?\b/i,'The provided ten-minute estimate','给定的十分钟估计','The estimate is about ten minutes.'),R(/\b(estimate|about|may|might|approximately)\b/i,'Uncertainty language','保留不确定性','It may change.'),R(/\b(check|update|host|confirm)\b/i,'Offering an update','愿意核对进展','I can check with the host for an update.')],
    [R(/\b(sorry|wait|waiting|patience)\b/i,'Acknowledging the wait','回应等待问题','I’m sorry you have been waiting.'),manual,R(/\b(check|team|update|back)\b/i,'A check or update','核对或更新','I’ll check with the team and come back with an update.')],
    [R(/\b(ten|10)\b/i,'Ten','十点','The front desk closes at ten.'),R(/\b(evening|p\.?m\.?)\b/i,'Evening','晚上','That’s ten in the evening.'),R(/\b(anything else|help|other)\b/i,'Offering further help','询问其他需求','Is there anything else I can help you with?')],
    [greeting,R(/\bhold\b/i,'A request to hold','请稍等','Please hold for a moment.'),R(/\bmanager\b/i,'The manager','经理','I’ll connect you to the manager.')],
    [R(/\b(spell|spelling)\b/i,'A spelling request','请拼写','Could you spell your last name?'),ask,R(/\b(check|booking|reservation|details)\b/i,'A reason for asking','解释询问原因','Then I can check the booking details.')],
    [R(/\b(one|1)\b/i,'One o’clock','一点','You would like to check out at one p.m.'),R(/\btomorrow\b/i,'Tomorrow','明天','Tomorrow afternoon, correct?'),R(/\b(check|policy|confirm|late.check.?out)\b/i,'Checking the policy','核对政策','Let me check the late-checkout policy.')],
    [R(/\b(two|2)\s+(more\s+)?towels?\b/i,'Two towels','两条毛巾','That’s two more towels.'),R(/\b(214|two fourteen|two one four)\b/i,'Room 214','214 房间','For room two fourteen, correct?'),R(/\b(housekeeping|pass|tell|request)\b/i,'Passing the request on','传达需求','I’ll pass your request to housekeeping.')],
    [R(/\b(restock|shelf|supplies)\b/i,'The restocking task','补货任务','I should restock the shelf.'),R(/\bbefore\b/i,'The order of actions','行动顺序','Before taking my break.'),R(/\b(where|find|extra|supplies|how)\b/i,'A practical question','实际问题','Where can I find the extra supplies?')],
    [R(/\b(time|start|finish|hours)\b/i,'Shift-time details','班次时间细节','What time does the shift start and finish?'),R(/\b(schedule|available|availability|check)\b/i,'Checking availability','核对是否有空','Let me check my schedule first.'),R(/\b(supervisor|process|change|approval)\b/i,'The shift-change process','换班流程','I’ll check the process with our supervisor.')],
    [R(/\b(not trained|haven't been trained|have not been trained|training|don't know how)\b/i,'A training or uncertainty statement','培训或不确定性说明','I haven’t been trained on this machine.'),manual,help],
    [greeting,R(/\b(difficult|instructions|follow|concern|struggle|problem)\b/i,'A specific difficulty','具体困难','I’m finding the instructions difficult to follow.'),ask],
    [R(/\b(let you know|notify|inform|call|hi)\b/i,'A notification opening','主动通知','Hi, I wanted to let you know ___.'),R(/\b(bus|delayed|late|delay)\b/i,'The delay','延误情况','My bus is delayed, and I may be late.'),R(/\b(update|arrival|option|checking|as soon)\b/i,'An update or next action','更新或下一步','I’ll update you when I have a clearer arrival time.')],
    [R(/\b(study|studying|student|major|university|college)\b/i,'Current studies','目前学习情况','I’m a student studying ___.'),R(/\b(enjoy|interested|like|learning|people|team)\b/i,'A relevant personal detail','相关个人细节','One thing I enjoy is ___.'),manual],
    [R(/\b(goal|want|hope|aim)\b/i,'A main goal','主要目标','My primary goal is ___.'),reason,R(/\b(english|communicat|questions|clarification|people|work)\w*\b/i,'A communication or work connection','沟通或工作连接','I want to understand questions and help people at work.')],
    [R(/\b(job|team|project|event|experience|worked|helped)\b/i,'An experience clue','经历线索','I haven’t had a formal job, but I ___.'),R(/\b(responsible|responsibility|my role|i helped)\b/i,'Your responsibility','自己的责任','I was responsible for ___.'),R(/\b(learned|learnt|taught|realized|realised)\b/i,'A lesson learned','学到的东西','It taught me to ___.')],
    [R(/\b(would|will|ask|learn|effort)\b/i,'A constructive action','建设性行动','I would ask about the role and learn the work.'),R(/\b(role|training|responsibilities|job|work)\b/i,'The actual work','实际岗位内容','What training and responsibilities would the role involve?'),R(/\b(flexible|responsib|suitable|willing|learn|effort)\w*\b/i,'Flexibility or responsibility','灵活性或责任','If suitable, I would learn the work and do it responsibly.')],
    [R(/\b(of course|certainly|sure|yes)\b/i,'Acknowledgement','回应请求','Of course.'),R(/\bhold\b/i,'A request to hold','请稍等','Please hold on for a moment.'),R(/\b(transfer|connect)\b.*\bmanager\b/i,'A transfer to the manager','转接给经理','I’ll transfer your call to the front desk manager.')]
  ];
  // Extension task IDs follow the original 40 without changing saved learner IDs.
  rules.push(...window.SpeakEasyCourse.lessons.flatMap(l=>l.tasks).filter(t=>t.textClues).map(t=>t.textClues));
  const grammar = [
    [/\byou means\b/i,'You mean…','With “you,” use “mean,” not “means.”','you 作主语，使用 mean，不是 means。'],
    [/\bi am agree\b/i,'I agree.','“Agree” is already a verb; remove “am.”','agree 已经是动词，不需要 am。'],
    [/\b(?:want|hope|need) (?:improve|learn|become|work|go)\b/i,null,'Add “to” before the verb: “I want to improve…”','动词前补 to，例如 I want to improve…。'],
    [/\benjoy to\b/i,'I enjoy …-ing.','After “enjoy,” normally use an -ing form.','enjoy 后通常接动名词。'],
    [/\b(?:did not|didn't) (?:went|understood|caught|knew)\b/i,null,'After “did not,” use the base verb: go, understand, catch, know.','did not 后使用动词原形：go、understand、catch、know。'],
    [/\bwould like to (?:checking|working|learning)\b/i,null,'After “would like to,” use the base verb.','would like to 后使用动词原形。'],
    [/\bi have went\b/i,'I have gone… / I went…','Use “gone” with “have,” or use “went” alone for a past event.','have 后用 gone；或用 went 描述过去事件。'],
    [/\bthree number\b/i,'three numbers','Use a plural noun after “three.”','three 后的可数名词需要复数。'],
    [/\b(?:two|2) towel\b/i,'two towels','Use a plural noun after “two.”','two 后的可数名词需要复数。'],
    [/\btransfer (?:your|the) call to manager\b/i,'transfer your call to the manager','Use “the manager” when referring to that specific person.','这里指具体的经理，使用 the manager。'],
    [/\bhe don't\b/i,'He doesn’t…','Use “doesn’t” with “he” in the present tense.','一般现在时中，he 配 does not / doesn’t。'],
    [/\bmore better\b/i,'better','“Better” is already a comparative form.','better 已经是比较级，不再加 more。']
  ];
  window.SpeakEasyFeedback = { rules, check(task,text) {
    const clean=text.replace(/[’‘]/g,"'").trim();
    const spec=rules[Number(task.id.split('-')[1])-1];
    if(!spec)throw new Error('Unknown task');
    const items=spec.map(r=>{
      if(!r.pattern)return {...r,result:'manual',evidence:''};
      const hit=clean.length>0&&(typeof r.pattern==='function'?r.pattern(clean):clean.match(r.pattern));
      return {...r,result:hit?'found':'missing',evidence:Array.isArray(hit)?hit[0]:hit?clean.slice(0,120):''};
    });
    return {found:items.filter(i=>i.result==='found').length,total:items.filter(i=>i.result!=='manual').length,items,
      grammar:grammar.flatMap(([p,replacement,en,zh])=>{const m=clean.match(p);return m?[{original:m[0],replacement,explanation:{en,'zh-CN':zh}}]:[]})};
  }};
})();

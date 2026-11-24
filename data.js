(function(){
"use strict";
const categories=["Emergency response","Medical","Breathing & allergy","Heat & cold","Water safety","Bites & stings","Injury"];
const sizes=[5,10,15];
function scenario(id,name,category,aliases,desc,stages){const all=stages.slice();all.push("Reassess the person after first aid for "+name.toLowerCase()+" ~ Check for improvement or new danger signs ~ Escalate promptly if their condition worsens.","Prepare a handover about "+name.toLowerCase()+" ~ Share the timeline, observations and actions taken ~ Continue monitoring and follow responder instructions.");const a=all.slice(0,5).map(x=>x.split(" ~ "));if(a.some(x=>x.length!==3))throw new Error("Checklist content needs three steps per action group: "+name);return{id,name,category,aliases:aliases.split("|").map(x=>x.trim()).filter(Boolean),desc,levels:[a.map(x=>x[0]),a.flatMap(x=>x.slice(0,2)),a.flatMap(x=>x.slice(0,3))],checks:[[],[],[]],localOnly:false}}
const catalog=[
scenario("starter-0","Unconscious but breathing","Emergency response","unresponsive|passed out|recovery position|collapsed but breathing","Unresponsive person who is breathing normally.",[
"Check scene safety and response ~ Call Triple Zero (000) for an unresponsive person ~ Ask a bystander to bring an AED if available.",
"Open the airway and check breathing ~ If breathing normally, place in the recovery position when appropriate ~ Stay with the person.",
"Monitor breathing and response continuously ~ If breathing becomes abnormal, turn onto the back and start CPR ~ Record changes and timings."
]),
scenario("starter-1","Cardiac arrest — CPR and AED","Emergency response","cardiac arrest|CPR|AED|defibrillator|not breathing normally|collapse","Sudden collapse with no response and absent or abnormal breathing.",[
"Check for danger and responsiveness ~ Send for help and call Triple Zero (000) ~ Ask someone to get an AED.",
"Open the airway and check breathing for no more than 10 seconds ~ If not breathing normally, start CPR ~ Use the AED as soon as it arrives.",
"Give 30 compressions and 2 breaths if trained and willing ~ Continue with minimal interruption ~ Follow AED prompts and keep everyone clear during analysis."
]),
scenario("starter-2","Severe bleeding","Emergency response","bleeding|haemorrhage|hemorrhage|haemorrhaging|blood loss|wound","Major external bleeding or suspected life-threatening blood loss.",[
"Check safety and use a barrier if available ~ Call 000 for severe or uncontrolled bleeding ~ Lie the person down and reassure them.",
"Apply firm direct pressure over the bleeding point ~ If blood comes through, add a pad and keep pressure focused ~ Maintain pressure while help is arranged.",
"For severe limb bleeding not controlled by pressure, use a tourniquet only if trained and available ~ Use wound packing only if trained and suitable ~ Monitor for shock and note times."
]),
scenario("starter-3","Burns and scalds","Injury","burn|burns|scald|hot liquid|chemical burn|electrical burn","Thermal, scald, chemical or electrical burns.",[
"Stop the burning process and make the area safe ~ Call 000 for severe burns, breathing problems or major electrical injury ~ Remove jewellery and loose clothing near the burn.",
"Cool a thermal burn under cool running water for 20 minutes as soon as possible ~ Do not use ice, creams or adhesive dressings ~ Do not remove clothing stuck to skin.",
"Cover loosely with a clean non-stick dressing after cooling ~ For chemical burns, protect yourself and follow emergency advice on rinsing ~ Watch for shock and airway changes."
]),
scenario("starter-4","Choking — blocked airways","Emergency response","choking|blocked airway|blocked airways|airway obstruction|something stuck|can't breathe","Partial or severe airway obstruction from a foreign body.",[
"Ask if the person is choking and assess whether they can cough, speak or breathe ~ Encourage an effective cough ~ Call 000 if obstruction is severe or worsening.",
"For severe obstruction, use age-appropriate first aid from current training ~ Ask someone to call 000 and get an AED ~ Do not perform blind finger sweeps.",
"If the person becomes unresponsive, lower them safely and start CPR ~ Check for a visible object before giving breaths ~ Continue until normal breathing returns or help takes over."
]),
scenario("starter-5","Asthma attack","Breathing & allergy","asthma|wheezing|difficulty breathing|constricted breathing|shortness of breath|reliever inhaler","Breathing difficulty in a person with asthma.",[
"Help the person sit comfortably and stay calm ~ Follow their asthma action plan if available ~ Call 000 for severe symptoms or rapid deterioration.",
"Assist with their prescribed reliever and spacer according to their plan and your training ~ Keep them at rest and stay with them ~ Reassess breathing and ability to speak.",
"If symptoms are severe or not improving promptly, call or update 000 ~ Continue support as directed by their plan or call taker ~ Start CPR if they become unresponsive and are not breathing normally."
]),
scenario("starter-6","Anaphylaxis","Breathing & allergy","anaphylaxis|severe allergy|allergic reaction|adrenaline|epinephrine|EpiPen","Rapid severe allergic reaction affecting breathing or circulation.",[
"Recognise possible anaphylaxis and call 000 ~ Help the person use their prescribed adrenaline injector promptly ~ Keep them lying flat where possible; do not let them stand or walk.",
"Follow the injector instructions and their action plan ~ If breathing is difficult, allow a position that helps without standing ~ If vomiting or unconscious but breathing normally, use the recovery position.",
"Monitor breathing and responsiveness continuously ~ Follow 000 advice; another prescribed injector may be needed if symptoms persist ~ If breathing becomes abnormal, begin CPR and use an AED."
]),
scenario("starter-7","Epileptic seizure","Medical","seizure|fit|convulsion|epilepsy|fitting","A seizure, including a convulsion or suspected epileptic event.",[
"Make the area safer and protect the person from hazards ~ Time the seizure and call 000 for a first, prolonged or repeated seizure or serious injury ~ Do not restrain them.",
"Do not put anything in the person's mouth ~ Cushion the head and loosen tight clothing around the neck ~ When the seizure stops, check breathing and responsiveness.",
"If breathing normally but still unresponsive, use the recovery position and monitor ~ If not breathing normally, begin CPR ~ Stay with them and give a clear handover."
]),
scenario("starter-8","Suspected fracture","Injury","fracture|broken bone|broken limb|bone injury","Possible broken bone after an injury.",[
"Check for danger and serious bleeding ~ Call 000 for an open fracture, major deformity, severe injury or shock ~ Keep the person still and comfortable.",
"Support the injured part in the position found ~ Do not straighten it, push exposed bone back or test movement ~ Cover an open wound with a clean dressing.",
"Recheck comfort and circulation beyond the injury when appropriate ~ Keep the person warm and monitor for shock ~ Arrange medical assessment and watch for deterioration."
]),
scenario("starter-9","Heat exhaustion and heatstroke","Heat & cold","heat illness|hyperthermia|heat exhaustion|heatstroke|heat stroke|overheating|heat stress","Heat-induced illness, including possible heatstroke.",[
"Move the person to shade or a cooler place ~ Call 000 for confusion, collapse, seizure or severe illness ~ Begin cooling promptly without delaying help.",
"Remove excess clothing, wet the skin with cool water and fan continuously ~ Offer cool water only if fully alert and able to swallow ~ Observe breathing and responsiveness throughout.",
"If symptoms are severe or do not improve quickly, call 000 ~ Continue active cooling while help is on the way ~ Record symptoms, changes and cooling measures."
]),
scenario("starter-10","Hypoglycaemia — low blood sugar","Medical","hypoglycaemia|hypoglycemia|low blood sugar|diabetes hypo|hypo|shaky diabetic","Possible low blood glucose in a person with diabetes.",[
"Look for confusion, sweating, shaking or unusual behaviour and ask about diabetes ~ Call 000 if drowsy, unconscious, having a seizure or unable to swallow ~ Give nothing by mouth if swallowing is unsafe.",
"If fully alert and able to swallow, assist with fast-acting glucose according to their plan and your training ~ Stay with them and reassess ~ Call 000 if they do not improve or you are unsure.",
"Once recovered, follow their plan for longer-acting food if directed ~ Do not give anything by mouth while consciousness or swallowing is impaired ~ Record treatment and response."
]),
scenario("starter-11","Stroke","Emergency response","stroke|FAST|facial droop|face drooping|arm weakness|slurred speech|sudden weakness","Sudden signs such as facial droop, arm weakness or speech difficulty.",[
"Use FAST to recognise possible stroke signs ~ Call 000 immediately and note when symptoms began or the person was last well ~ Keep them at rest and reassure them.",
"Do not give food, drink or medication ~ Monitor breathing, responsiveness and symptom changes ~ Follow the emergency call taker's instructions.",
"Record onset and changes for responders ~ If unresponsive but breathing normally, protect the airway ~ If breathing is abnormal, begin CPR."
]),
scenario("new-hypothermia","Hypothermia","Heat & cold","hypothermia|cold exposure|very cold|shivering|cold stress","Dangerous cooling after cold, wet or windy exposure.",[
"Move the person gently to a warm, dry, sheltered place ~ Call 000 for severe signs or deterioration ~ Handle gently and minimise movement.",
"Remove wet clothing when practical and insulate with dry blankets ~ Cover the head; give a warm drink only if fully alert and able to swallow ~ Do not rub them or give alcohol.",
"Use gentle warming and avoid direct heat that can burn skin ~ Monitor breathing and responsiveness ~ Start CPR if they are unresponsive and not breathing normally."
]),
scenario("new-snakebite","Snakebite","Bites & stings","snake bite|snakebite|venomous snake|suspected snake bite|elapid bite","Suspected Australian snake bite; treat as potentially life-threatening.",[
"Call 000, lie the person down and keep them as still and calm as possible ~ Do not let them walk or wash the bite ~ Note the time if known.",
"Apply pressure immobilisation to the bitten limb promptly when trained and equipped ~ Bandage over the bite then along the limb and splint it ~ Keep the person still.",
"Do not cut, suck, wash or tourniquet the bite ~ Do not remove the bandage or splint before medical advice ~ Monitor breathing and record bandaging time."
]),
scenario("new-jellyfish","Jellyfish sting — tropical or unknown","Bites & stings","jellyfish|jelly fish|marine sting|box jellyfish|irukandji|tropical jellyfish","Marine sting where a tropical or dangerous species may be involved.",[
"Get the person out of the water safely and alert a lifeguard ~ Call 000 for severe pain, breathing difficulty, collapse or suspected dangerous tropical sting ~ Avoid bare-hand contact with tentacles.",
"For suspected box jellyfish or tropical species, flood the area with vinegar for at least 30 seconds if available and follow local emergency advice ~ Do not use fresh water for a suspected tropical sting ~ Do not apply pressure bandaging.",
"If species is unknown, seek lifeguard or emergency service advice promptly ~ Monitor breathing and responsiveness ~ Treat collapse or abnormal breathing as an emergency."
]),
scenario("new-bluebottle","Bluebottle sting","Bites & stings","bluebottle|blue bottle|non-tropical jellyfish sting|Portuguese man o war","Painful sting from a bluebottle or other non-tropical jellyfish.",[
"Get the person out of the water safely and alert a lifeguard ~ Call 000 if breathing is affected, pain is severe or the person collapses ~ Avoid bare-hand contact with tentacles.",
"For a confirmed bluebottle sting, use hot water that will not burn to relieve pain ~ Follow local lifeguard advice if species is uncertain ~ Do not use vinegar for a bluebottle sting.",
"Seek medical help if symptoms are severe or worsening ~ Watch for allergic reaction, breathing changes or collapse ~ Do not rub the sting or apply pressure bandaging."
]),
scenario("new-panic","Panic attack","Medical","panic|panic attack|anxiety attack|hyperventilating|acute anxiety","A person experiencing intense fear or panic symptoms.",[
"Check safety and speak calmly ~ Ask what would help and reduce noise or crowding ~ Treat new, severe or unusual chest pain or breathing difficulty as a possible medical emergency.",
"Use short, clear reassurance and stay with the person ~ Encourage comfortable, unforced breathing only if helpful ~ Do not use a paper bag or force breathing exercises.",
"Reassess; do not assume panic explains every symptom ~ Call 000 if symptoms are severe, new, worsening or uncertain ~ Support access to ongoing care when the crisis eases."
]),
scenario("new-heart-attack","Chest pain — possible heart attack","Emergency response","heart attack|chest pain|angina|pressure in chest|cardiac pain","Chest discomfort or other possible signs of a heart attack.",[
"Stop activity and help the person rest ~ Call 000 for suspected heart attack ~ Do not let them drive themselves.",
"Ask about onset and their prescribed action plan ~ Assist only with their own prescribed medicine within your training ~ Do not delay the ambulance to see if symptoms pass.",
"Monitor breathing and responsiveness ~ If unresponsive and not breathing normally, start CPR and get an AED ~ Give responders the symptom timeline and medicines taken."
]),
scenario("new-shock","Shock","Emergency response","shock|circulatory shock|pale sweaty|weak pulse|collapse after injury","Possible life-threatening shock following illness or injury.",[
"Call 000 for suspected shock ~ Treat the cause, especially severe bleeding ~ Help the person lie comfortably and reassure them.",
"Keep them warm with a blanket and loosen tight clothing ~ Do not raise their legs or apply direct heat ~ Avoid food or drink if consciousness is reduced or urgent surgery may be needed.",
"Monitor breathing and responsiveness continuously ~ Protect the airway if needed ~ Record changes and give responders a clear handover."
]),
scenario("new-drowning","Drowning or submersion","Water safety","drowning|near drowning|submersion|water rescue|pulled from water","Person rescued from water with possible breathing injury.",[
"Do not enter unsafe water; summon trained rescue and call 000 ~ Remove the person from danger only when safe ~ Check response and breathing.",
"If unresponsive and not breathing normally, start CPR and use an AED when available ~ Follow current training and 000 instructions ~ Give rescue breaths if trained and willing.",
"Continue CPR until normal breathing returns or help takes over ~ If breathing normally, keep the airway clear and monitor closely ~ Arrange urgent medical assessment after submersion."
]),
scenario("new-poison","Poisoning or harmful exposure","Medical","poisoning|poison|chemical exposure|toxic substance|ingestion|Poisons Information Centre","Possible swallowing, inhaling or skin exposure to a harmful substance.",[
"Protect yourself and move away from fumes if safe ~ Call 000 for collapse, seizure or severe breathing difficulty ~ In Australia call Poisons Information on 13 11 26 for advice.",
"Do not induce vomiting or give a home remedy unless poison experts direct you ~ For skin or eye exposure, avoid contact and follow expert advice on rinsing ~ Keep the product container.",
"Note substance, amount, route and time if known ~ Monitor breathing and follow poison service advice ~ Give responders product details and actions already taken."
]),
scenario("new-overdose","Suspected overdose","Medical","overdose|drug overdose|medication overdose|too many tablets|unknown substance","Possible overdose or dangerous effect from medicines or other substances.",[
"Check scene safety and avoid contact with unknown substances ~ Call 000 for reduced consciousness, seizure or breathing difficulty ~ Ask for naloxone if opioid overdose is possible.",
"Follow 000 advice and support breathing ~ Give naloxone if available and within your training ~ Do not leave them alone or induce vomiting.",
"Monitor breathing and responsiveness; symptoms can return after naloxone ~ If not breathing normally, begin CPR and use an AED ~ Tell responders the suspected substance and timing."
]),
scenario("new-breathing","Breathing difficulty — other causes","Breathing & allergy","difficulty breathing|shortness of breath|breathless|can't breathe|constricted breathing|respiratory distress","Breathing difficulty with no clear known cause.",[
"Check safety and call 000 for severe or worsening difficulty ~ Help the person find a position that eases breathing ~ Loosen restrictive clothing.",
"Ask about onset, known conditions, allergies and prescribed plans ~ Assist only with their own prescribed medicines within training ~ Do not give food or drink if swallowing is impaired.",
"Monitor breathing, speech and responsiveness ~ Be ready to start CPR if they become unresponsive and are not breathing normally ~ Give responders the timeline and known triggers."
]),
scenario("new-fainting","Fainting","Medical","fainting|fainted|syncope|light-headed|near faint|passed out briefly","Brief loss of consciousness or feeling faint.",[
"Help a faint person lie down safely ~ Check for injury and responsiveness ~ Call 000 if they do not recover promptly or have serious symptoms.",
"Keep them lying comfortably and loosen tight clothing ~ Do not make them stand quickly or give anything by mouth while drowsy ~ Ask about symptoms when fully recovered.",
"Seek urgent help for chest pain, breathing trouble, seizure, major injury or repeated fainting ~ If unresponsive but breathing normally, protect the airway and monitor ~ Record duration and recovery."
]),
scenario("new-frostbite","Frostbite or cold injury","Heat & cold","frostbite|frozen skin|cold injury|frostnip|numb fingers in cold","Local tissue injury from freezing or extreme cold.",[
"Move out of the cold and protect the area from further injury ~ Seek urgent care for deep, extensive or worsening injury ~ Do not rub or massage the skin.",
"Remove jewellery or constricting items if easy before swelling increases ~ Protect the area with a loose dry dressing ~ Do not thaw if it may refreeze before care.",
"Follow medical advice for rewarming ~ Avoid direct heat and do not break blisters ~ Monitor overall temperature and treat associated hypothermia."
]),
scenario("new-hyperglycaemia","High blood sugar or diabetic illness","Medical","hyperglycaemia|hyperglycemia|high blood sugar|diabetic emergency|diabetic ketoacidosis|DKA","Possible high blood glucose or another diabetes-related emergency.",[
"Look for thirst, frequent urination, nausea, abdominal pain or unusual drowsiness ~ Call 000 for severe symptoms, vomiting or confusion ~ Ask about their diabetes plan.",
"Help them follow their own plan and use only prescribed medicines ~ Do not give insulin or change medication unless trained and authorised ~ Offer water only if fully alert and able to swallow.",
"Monitor breathing and responsiveness ~ Do not delay care while checking devices ~ Record symptoms, medicines and any readings volunteered."
]),
scenario("new-head","Head injury","Injury","head injury|concussion|hit head|knocked out|bump to head|head trauma","Head impact with possible concussion or more serious injury.",[
"Call 000 for loss of consciousness, worsening confusion, seizure, severe headache or major trauma ~ Keep the person still and reassure them ~ Do not move them unnecessarily.",
"Monitor responsiveness and breathing ~ Support the head and neck in the position found ~ Do not give food or drink to a drowsy person.",
"Control bleeding around, not by pressing on, a suspected skull injury ~ Seek assessment for concerning symptoms or deterioration ~ Record mechanism, time and changes."
]),
scenario("new-spinal","Suspected spinal injury","Injury","spinal injury|neck injury|back injury|spine|possible spinal damage|diving injury","Possible neck or back injury after trauma.",[
"Call 000 for significant trauma, neck or back pain, numbness or weakness ~ Ask the person not to move and reassure them ~ Move only if danger requires it.",
"Support the head comfortably without forcing alignment ~ Monitor breathing and responsiveness ~ Airway care takes priority if they vomit or deteriorate.",
"Maintain support while waiting for responders ~ If movement is essential, minimise bending and twisting within your training ~ Record symptoms and mechanism."
]),
scenario("new-eye","Eye injury or chemical splash","Injury","eye injury|chemical in eye|foreign body in eye|eye splash|eye trauma|grit in eye","Chemical splash, embedded object or other eye injury.",[
"Identify possible chemical, penetrating or minor injury ~ Seek urgent help for severe pain, vision loss or penetrating injury ~ Do not rub the eye.",
"For chemical splash, begin immediate continuous irrigation with clean water and seek urgent advice ~ Do not remove an embedded object ~ Remove contact lenses only if easy while rinsing.",
"Continue rinsing while arranging care ~ Cover an injured eye loosely without pressure ~ Note the substance, exposure time and vision changes."
]),
scenario("new-wound","Minor wound or cut","Injury","cut|graze|abrasion|minor wound|laceration|scrape","Minor skin wound without life-threatening bleeding.",[
"Check safety and use gloves or a barrier if available ~ Apply direct pressure for bleeding ~ Get urgent help if bleeding is severe or the wound is deep.",
"Once bleeding is controlled, rinse a minor wound with clean running water ~ Remove only loose surface debris ~ Cover with a clean dressing.",
"Seek advice if medical review or tetanus protection may be needed ~ Watch for increasing redness, swelling, pain or discharge ~ Keep the dressing clean."
]),
scenario("new-nosebleed","Nosebleed","Injury","nosebleed|epistaxis|bleeding nose|nose bleed","Bleeding from the nose.",[
"Sit the person down and lean them forward ~ Ask them to breathe through the mouth and spit blood out ~ Seek urgent help if bleeding is heavy or follows serious injury.",
"Pinch the soft part of the nose continuously for 10 minutes without checking ~ Keep the head forward, not tilted back ~ Reassure and use a timer.",
"If bleeding continues, repeat pressure and seek medical advice ~ Call 000 for severe blood loss, breathing difficulty or collapse ~ Avoid nose blowing after it stops."
]),
scenario("new-sprain","Sprain or strain","Injury","sprain|strain|twisted ankle|soft tissue injury|pulled muscle","Possible soft-tissue injury to a joint or muscle.",[
"Stop activity and check for severe pain, deformity or inability to use the limb ~ Seek urgent care if fracture is possible ~ Protect the area from further harm.",
"Rest and comfortably support the injured part ~ Use a wrapped cold pack for comfort if helpful ~ Do not force movement or put ice directly on skin.",
"Reassess pain, swelling and movement ~ Arrange medical review if symptoms are severe or not improving ~ Return to activity gradually when safe."
]),
scenario("new-dislocation","Suspected dislocation","Injury","dislocation|dislocated shoulder|joint out|joint dislocated|kneecap out","Possible joint dislocation after injury.",[
"Call 000 for major trauma, poor circulation or an open injury ~ Keep the person still and support the joint ~ Do not try to put it back.",
"Immobilise the joint in the position found ~ Remove rings or tight items only if easy before swelling increases ~ Check for changes in sensation or colour.",
"Seek prompt medical care for assessment ~ Monitor pain and circulation while waiting ~ Record how and when it happened."
]),
scenario("new-electric","Electric shock","Injury","electric shock|electrocution|electrical injury|power line|electricity injury","Injury from household, industrial or lightning electricity.",[
"Do not touch the person until the source is isolated and the scene is safe ~ Call 000 for significant shock, collapse, burns or symptoms ~ Keep others away from live wires.",
"Once safe, check responsiveness and breathing ~ If not breathing normally, start CPR and use an AED ~ Treat visible burns after life threats.",
"Arrange medical assessment after significant electrical exposure ~ Monitor for heart or breathing symptoms ~ Tell responders about the source, duration, falls and burns."
]),
scenario("new-amputation","Amputation or partial amputation","Injury","amputation|severed finger|severed limb|partially amputated|traumatic amputation","Major injury involving a fully or partly severed body part.",[
"Call 000 and control life-threatening bleeding with firm direct pressure ~ Help the person lie down and reassure them ~ Do not remove an embedded object.",
"Support the injured part; use a tourniquet only for severe limb bleeding if trained and available ~ Wrap a severed part in clean moist gauze, seal in a bag and keep cool without direct ice ~ Tell responders where it is and when it was separated.",
"Monitor breathing and signs of shock ~ Do not delay ambulance care to retrieve the part ~ Note timings and bleeding control for responders."
]),
scenario("new-dental","Dental injury","Injury","tooth knocked out|dental injury|broken tooth|avulsed tooth|tooth trauma","Knocked-out, fractured or displaced tooth after injury.",[
"Check for serious head, face or airway injury first ~ Call 000 if present ~ Control bleeding gently with clean gauze.",
"For a permanent tooth knocked out, hold it by the crown, not the root ~ Rinse briefly with milk or saline if dirty; do not scrub ~ Keep it moist in milk if it cannot be replaced safely.",
"Seek urgent dental care immediately ~ Do not reinsert a baby tooth ~ Bring the tooth or fragments and note the injury time."
]),
scenario("new-animal-bite","Animal or human bite","Bites & stings","dog bite|cat bite|human bite|animal bite|mammal bite|scratch","Bite or scratch with bleeding, infection or tissue injury risk.",[
"Make the scene safe and separate the person from the animal without added risk ~ Call 000 for severe bleeding or major injury ~ Use a barrier if available.",
"Control bleeding with direct pressure and rinse a minor wound with clean water ~ Do not close a deep or contaminated wound yourself ~ Cover it with a clean dressing.",
"Arrange prompt medical advice because bites may need further care ~ Note animal details if safely known ~ Watch for infection or worsening pain."
]),
scenario("new-spider","Spider bite","Bites & stings","spider bite|funnel web|funnel-web|redback|mouse spider","Spider bite; suspected funnel-web or mouse spider bites need urgent care.",[
"Call 000 for suspected funnel-web or mouse spider bite, severe symptoms or deterioration ~ Keep the person still and reassure them ~ Do not wash the bite.",
"For suspected funnel-web or mouse spider bite, apply pressure immobilisation and splint the limb if trained ~ Do not use this method for other spiders unless local guidance says so ~ Note the time.",
"Do not cut, suck or tourniquet the bite ~ Monitor breathing and consciousness ~ Stay with them and tell responders the suspected spider if known."
]),
scenario("new-insect","Insect sting or local bite","Bites & stings","bee sting|wasp sting|ant bite|insect bite|bee|wasp|local sting","Local insect sting or bite without severe allergic symptoms.",[
"Move away from the source and check for anaphylaxis signs ~ Call 000 if breathing or circulation is affected ~ Remove a visible sting carefully if present.",
"Wash the area and use a wrapped cold pack for comfort ~ Avoid scratching and follow the person's allergy plan if relevant ~ Do not squeeze a venom sac.",
"Observe for spreading swelling, dizziness or breathing changes ~ Use their prescribed adrenaline injector and call 000 if anaphylaxis develops ~ Seek advice if symptoms worsen."
])
];

window.VITALS_DATA={categories:categories,sizes:sizes,catalogVersion:3,catalog:catalog};
})();

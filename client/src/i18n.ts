import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "app": {
                "chronicle": "Chronicle",
                "capture_mode": "Capture Mode:",
                "swap_positions": "Swap positions",
                "forward_only": "Forward only",
                "protected_adjacency": "Protected Adjacency:",
                "yes_pieces": "Yes, {{count}} pieces",
                "no": "No",
                "blockades": "Blockades:",
                "bearing_off": "Bearing Off:",
                "requires_exact_throw": "Requires exact throw",
                "any_sufficient_throw": "Any sufficient throw",
                "rules_title": "{{name}} Rules"
            },
            "hud": {
                "senet": "Senet",
                "rules": "Rules: {{name}}",
                "current_turn": "Current Turn:",
                "wins": "{{player}} WINS!",
                "restart_game": "Restart Game",
                "language": "Language",
                "players": {
                    "light": "LIGHT",
                    "dark": "DARK"
                }
            },
            "throw": {
                "turn": "{{player}}'S TURN",
                "moves": "MOVES: {{value}}",
                "perfect_throw": "Perfect Throw",
                "game_over": "Game Over",
                "click_to_throw": "Click sticks to throw"
            },
            "square": {
                "effect": "Effect: {{effect}}",
                "requires_throw": "Requires: Throw of {{num}}",
                "cannot_bypass": "Cannot bypass",
                "effects": {
                    "none": "None",
                    "lock": "Lock",
                    "water": "Water",
                    "require_throw": "Require Throw"
                },
                "names": {
                    "15": "House of Rebirth",
                    "26": "House of Happiness",
                    "27": "House of Water",
                    "28": "House of Three Truths",
                    "29": "House of Re-Atoum",
                    "30": "House of Horus"
                }
            },
            "ruleset": {
                "names": {
                    "museum": "Museum Classroom",
                    "common": "Common Reconstruction",
                    "custom": "Custom (Toggleable)"
                },
                "descriptions": {
                    "museum": "A straightforward, teachable ruleset aligned with museum/education handouts. Minimal confusing rules.",
                    "common": "A richer ruleset with protected pairs, blockades, and swap-capture logic matching widely-circulated rules.",
                    "custom": "Rules editor UI allowing the user to toggle game mechanics."
                }
            },
            "history": {
                "game_started": "🎲 [GAME] Game started.",
                "captured_swapped": "⚔️ Captured piece swapped to {{pos}}",
                "moved_to": "🏃 Moved piece to {{pos}}",
                "moved_to_afterlife": "🏃 Moved piece to afterlife",
                "washed_back": "🌊 Washed back to House of Rebirth (15)",
                "wins": "🏆 {{player}} WINS!",
                "extra_throw": "🎲 Extra throw granted!",
                "no_moves": "🚫 No legal moves for {{player}}. Turn passes."
            }
        }
    },
    "ar-EG": {
        translation: {
            "app": {
                "chronicle": "السجل",
                "capture_mode": "وضع الأسر:",
                "swap_positions": "تبديل المراكز",
                "forward_only": "للأمام فقط",
                "protected_adjacency": "التجاور المحمي:",
                "yes_pieces": "نعم، {{count}} قطع",
                "no": "لا",
                "blockades": "الحواجز:",
                "bearing_off": "الخروج:",
                "requires_exact_throw": "يتطلب رمية دقيقة",
                "any_sufficient_throw": "أي رمية كافية",
                "rules_title": "قواعد {{name}}"
            },
            "hud": {
                "senet": "سينيت",
                "rules": "القواعد: {{name}}",
                "current_turn": "الدور الحالي:",
                "wins": "{{player}} فاز!",
                "restart_game": "إعادة اللعبة",
                "language": "اللغة",
                "players": {
                    "light": "النور",
                    "dark": "الظلام"
                }
            },
            "throw": {
                "turn": "دور {{player}}",
                "moves": "الخطوات: {{value}}",
                "perfect_throw": "رمية ممتازة",
                "game_over": "انتهت اللعبة",
                "click_to_throw": "انقر على العصي للرمي"
            },
            "square": {
                "effect": "التأثير: {{effect}}",
                "requires_throw": "يتطلب: رمية {{num}}",
                "cannot_bypass": "لا يمكن تجاوزه",
                "effects": {
                    "none": "لا شيء",
                    "lock": "قفل",
                    "water": "ماء",
                    "require_throw": "يتطلب رمية"
                },
                "names": {
                    "15": "بيت النهضة",
                    "26": "بيت السعادة",
                    "27": "بيت الماء",
                    "28": "بيت الحقائق الثلاث",
                    "29": "بيت رع-أتوم",
                    "30": "بيت حورس"
                }
            },
            "ruleset": {
                "names": {
                    "museum": "فصل المتحف",
                    "common": "إعادة البناء الشائعة",
                    "custom": "مخصص (مع مفاتيح)"
                },
                "descriptions": {
                    "museum": "قواعد مباشرة وسهلة التعليم تتماشى مع النشرات التعليمية في المتاحف. الحد الأدنى من القواعد المربكة.",
                    "common": "قواعد أغنى مع أزواج محمية، وحواجز، ومنطق أسر بالتبديل يطابق القواعد المتداولة على نطاق واسع.",
                    "custom": "واجهة محرر القواعد تسمح للمستخدم بتبديل آليات اللعبة."
                }
            },
            "history": {
                "game_started": "🎲 [اللعبة] بدأت اللعبة.",
                "captured_swapped": "⚔️ تم أسر القطعة واستبدالها إلى {{pos}}",
                "moved_to": "🏃 تحركت القطعة إلى {{pos}}",
                "moved_to_afterlife": "🏃 تحركت القطعة إلى الحياة الآخرة",
                "washed_back": "🌊 جرفت المياه القطعة عودة إلى بيت النهضة (15)",
                "wins": "🏆 {{player}} فاز!",
                "extra_throw": "🎲 تم منح رمية إضافية!",
                "no_moves": "🚫 لا توجد حركات قانونية لـ {{player}}. الدور ينتقل."
            }
        }
    },
    "fr": {
        translation: {
            "app": {
                "chronicle": "Chronique",
                "capture_mode": "Mode de Capture :",
                "swap_positions": "Échanger les positions",
                "forward_only": "Vers l'avant uniquement",
                "protected_adjacency": "Contiguïté Protégée :",
                "yes_pieces": "Oui, {{count}} pièces",
                "no": "Non",
                "blockades": "Blocages :",
                "bearing_off": "Sortie des Pièces :",
                "requires_exact_throw": "Jet exact requis",
                "any_sufficient_throw": "Tout jet suffisant",
                "rules_title": "Règles {{name}}"
            },
            "hud": {
                "senet": "Senet",
                "rules": "Règles : {{name}}",
                "current_turn": "Tour Actuel :",
                "wins": "{{player}} GAGNE !",
                "restart_game": "Recommencer la partie",
                "language": "Langue",
                "players": {
                    "light": "LUMIÈRE",
                    "dark": "TÉNÈBRES"
                }
            },
            "throw": {
                "turn": "TOUR DE {{player}}",
                "moves": "DÉPLACEMENTS : {{value}}",
                "perfect_throw": "Jet Parfait",
                "game_over": "Fin de la Partie",
                "click_to_throw": "Cliquez sur les bâtons pour jeter"
            },
            "square": {
                "effect": "Effet : {{effect}}",
                "requires_throw": "Requis : Jet de {{num}}",
                "cannot_bypass": "Ne peut pas être contourné",
                "effects": {
                    "none": "Aucun",
                    "lock": "Verrouiller",
                    "water": "Eau",
                    "require_throw": "Jet Requis"
                },
                "names": {
                    "15": "Maison de la Renaissance",
                    "26": "Maison du Bonheur",
                    "27": "Maison de l'Eau",
                    "28": "Maison des Trois Vérités",
                    "29": "Maison de Re-Atoum",
                    "30": "Maison d'Horus"
                }
            },
            "ruleset": {
                "names": {
                    "museum": "Musée (Simple)",
                    "common": "Reconstruction Commune",
                    "custom": "Personnalisé"
                },
                "descriptions": {
                    "museum": "Des règles simples et faciles à enseigner, alignées sur les documents éducatifs des musées. Finis les règles complexes.",
                    "common": "Des règles plus riches avec des paires protégées, des blocages et une logique de capture par échange, correspondant aux règles largement diffusées.",
                    "custom": "Interface de l'éditeur de règles permettant à l'utilisateur d'activer ou de désactiver les mécanismes de jeu."
                }
            },
            "history": {
                "game_started": "🎲 [JEU] La partie a commencé.",
                "captured_swapped": "⚔️ Pièce capturée échangée à la position {{pos}}",
                "moved_to": "🏃 Pièce déplacée à {{pos}}",
                "moved_to_afterlife": "🏃 Pièce déplacée vers l'au-delà",
                "washed_back": "🌊 Ramené à la Maison de la Renaissance (15)",
                "wins": "🏆 {{player}} GAGNE !",
                "extra_throw": "🎲 Lancer supplémentaire accordé !",
                "no_moves": "🚫 Aucun mouvement légal pour {{player}}. Fin du tour."
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

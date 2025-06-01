        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const pokemonImage = document.getElementById('pokemonImage');
            const pokemonName = document.getElementById('pokemonName');
            const guessInput = document.getElementById('guessInput');
            const submitGuess = document.getElementById('submitGuess');
            const nextPokemon = document.getElementById('nextPokemon');
            const currentScoreDisplay = document.getElementById('currentScore');
            const highScoreDisplay = document.getElementById('highScore');
            const hintDisplay = document.getElementById('hintDisplay');
            const attemptsDisplay = document.getElementById('attemptsDisplay');
            const timerBar = document.getElementById('timerBar');
            
            // Game State
            let currentPokemon = null;
            let currentScore = 0;
            let highScore = localStorage.getItem('pokemonHighScore') || 0;
            let wrongAttempts = 0;
            let timer = null;
            let timeLeft = 10;
            let pokemonData = [];
            
            // Initialize game
            highScoreDisplay.textContent = highScore;
            initGame();
            
            // Fetch Pokémon list
            async function initGame() {
                try {
                    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
                    const data = await response.json();
                    pokemonData = data.results;
                    loadRandomPokemon();
                } catch (error) {
                    console.error('Error fetching Pokémon list:', error);
                    alert('Failed to load Pokémon. Please try again.');
                }
            }
            
            // Load a random Pokémon
            async function loadRandomPokemon() {
                try {
                    // Reset game state
                    resetGameState();
                    
                    // Get random Pokémon
                    const randomIndex = Math.floor(Math.random() * pokemonData.length);
                    const pokemonUrl = pokemonData[randomIndex].url;
                    
                    // Fetch Pokémon details
                    const response = await fetch(pokemonUrl);
                    currentPokemon = await response.json();
                    
                    // Set image (official artwork if available)
                    const imageUrl = currentPokemon.sprites.other['official-artwork'].front_default || 
                                     currentPokemon.sprites.front_default;
                    
                    pokemonImage.src = imageUrl;
                    pokemonImage.onload = function() {
                        pokemonImage.classList.remove('d-none');
                        startTimer();
                    };
                    
                    // Hide the name initially
                    pokemonName.textContent = '';
                    
                } catch (error) {
                    console.error('Error loading Pokémon:', error);
                    alert('Failed to load Pokémon. Please try again.');
                }
            }
            
            // Reset game state for new round
            function resetGameState() {
                // Reset UI
                pokemonImage.classList.add('d-none');
                pokemonImage.classList.remove('revealed');
                pokemonName.textContent = '';
                guessInput.value = '';
                guessInput.disabled = false;
                submitGuess.disabled = false;
                hintDisplay.textContent = '';
                
                // Reset attempts
                wrongAttempts = 0;
                updateAttemptsDisplay();
                
                // Reset timer
                clearInterval(timer);
                timeLeft = 10;
                timerBar.style.width = '100%';
                timerBar.style.backgroundColor = '#28a745';
            }
            
            // Start countdown timer
            function startTimer() {
                clearInterval(timer);
                timeLeft = 10;
                timerBar.style.width = '100%';
                timerBar.style.backgroundColor = '#28a745';
                
                timer = setInterval(function() {
                    timeLeft--;
                    timerBar.style.width = `${(timeLeft / 10) * 100}%`;
                    
                    // Change color when time is running out
                    if (timeLeft <= 3) {
                        timerBar.style.backgroundColor = '#dc3545';
                    }
                    
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        timeUp();
                    }
                }, 1000);
            }
            
            // Handle time up
            function timeUp() {
                revealPokemon();
                hintDisplay.textContent = "Time's up!";
                guessInput.disabled = true;
                submitGuess.disabled = true;
            }
            
            // Update attempts display
            function updateAttemptsDisplay() {
                const dots = attemptsDisplay.querySelectorAll('.attempt-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('used', index < wrongAttempts);
                });
            }
            
            // Reveal the Pokémon
            function revealPokemon() {
                pokemonImage.classList.add('revealed');
                pokemonName.textContent = currentPokemon.name;
                clearInterval(timer);
            }
            
            // Show type hint
            function showHint() {
                if (!currentPokemon || !currentPokemon.types || currentPokemon.types.length === 0) return;
                
                const types = currentPokemon.types.map(t => t.type.name);
                hintDisplay.textContent = `Hint: This Pokémon is ${types.join('/')} type.`;
            }
            
            // Check user's guess
            function checkGuess() {
                const userGuess = guessInput.value.trim().toLowerCase();
                const correctName = currentPokemon.name.toLowerCase();
                
                if (userGuess === correctName) {
                    // Correct guess
                    currentScore += 10;
                    currentScoreDisplay.textContent = currentScore;
                    
                    // Update high score if needed
                    if (currentScore > highScore) {
                        highScore = currentScore;
                        highScoreDisplay.textContent = highScore;
                        localStorage.setItem('pokemonHighScore', highScore);
                    }
                    
                    revealPokemon();
                    hintDisplay.textContent = "Correct! Well done!";
                    guessInput.disabled = true;
                    submitGuess.disabled = true;
                } else {
                    // Wrong guess
                    wrongAttempts++;
                    updateAttemptsDisplay();
                    
                    if (wrongAttempts === 1) {
                        showHint();
                    }
                    
                    if (wrongAttempts >= 3) {
                        revealPokemon();
                        hintDisplay.textContent = "Out of attempts!";
                        guessInput.disabled = true;
                        submitGuess.disabled = true;
                    } else {
                        hintDisplay.textContent = "Incorrect! Try again.";
                    }
                    
                    // Clear input for next attempt
                    guessInput.value = '';
                    guessInput.focus();
                }
            }
            
            // Event listeners
            submitGuess.addEventListener('click', checkGuess);
            
            guessInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkGuess();
                }
            });
            
            nextPokemon.addEventListener('click', function() {
                // Reset score for new round
                currentScore = 0;
                currentScoreDisplay.textContent = currentScore;
                loadRandomPokemon();
            });
        });
   
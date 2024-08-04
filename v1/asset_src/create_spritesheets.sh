#!/bin/bash

# create sheets per animation

montage -geometry 32x64 -background none -gravity south temp/Knight_Walk*.png ../assets/hero/knight_walk.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Run*.png ../assets/hero/knight_run.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Idle*.png ../assets/hero/knight_idle.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Attack*.png ../assets/hero/knight_attack.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Jump*.png ../assets/hero/knight_jump.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Fall*.png ../assets/hero/knight_fall.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Pivot*.png ../assets/hero/knight_pivot.png
montage -geometry 32x64 -background none -gravity south temp/Knight_Dead*.png ../assets/hero/knight_dead.png


#TexturePacker --format phaser --scale 0.5 --data ../assets/hero/hero.json --sheet ../assets/hero/hero.png --trim-sprite-names temp 

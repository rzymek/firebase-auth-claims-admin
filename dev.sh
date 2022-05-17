#!/bin/bash
cd $(dirname "$0")
tmux \
	setw -g mouse on \;\
	bind r respawn-pane -k \;\
	bind q kill-session	\;\
	new-session -c web "npm run start" \;\
	split-window -c functions "npm run build -- --watch" \;\
	split-window -fh -c functions "firebase emulators:start --only functions --project auth-claims-admin-demo" \;\
	select-pane -U


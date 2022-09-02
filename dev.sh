#!/bin/bash
cd $(dirname "$0")
tmux \
	setw -g mouse on \;\
	bind r respawn-pane -k \;\
	bind q kill-session	\;\
	new-session -c web "yarn && yarn start" \;\
	split-window -c functions "yarn && yarn build -- --watch" \;\
	split-window -fh -c functions "firebase emulators:start --only functions --project auth-claims-admin-demo" \;\
	select-pane -U


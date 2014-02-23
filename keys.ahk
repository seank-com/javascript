#SingleInstance force

ClonesPush(strKeys)
{
	global WowWinId1
	global WowWinId2
	global WowWinId3
	global WowWinId4
	global WowWinId5
	IfWinNotActive, ahk_id %WowWinId1%
		ControlSend, , %strKeys%, ahk_id %WowWinId1%
	IfWinNotActive, ahk_id %WowWinId2%
		ControlSend, , %strKeys%, ahk_id %WowWinId2%
	IfWinNotActive, ahk_id %WowWinId3%
		ControlSend, , %strKeys%, ahk_id %WowWinId3%
	IfWinNotActive, ahk_id %WowWinId4%
		ControlSend, , %strKeys%, ahk_id %WowWinId4%
	IfWinNotActive, ahk_id %WowWinId5%
		ControlSend, , %strKeys%, ahk_id %WowWinId5%
}

;Grab unique window ID's
WinGet, WowWinId, List, World of Warcraft

#IfWinActive ahk_class ConsoleWindowClass
^V::
SendInput {Raw}%clipboard%
return
#IfWinActive

#v::
clipboard = %clipboard%
SendInput, ^v
return

#z::
SendInput, !s
return

#a::
SendInput, ^{F4}
return

;SendInput, {home}
;SendInput, {right}
;SendInput, {space}
;SendInput, -
;SendInput, {delete}
;SendInput, {enter}
;sendinput +{down}
;sleep 100
;sendinput ^x
;sleep 100
;sendinput {lalt down}{tab}
;sleep 100
;sendinput {lalt up}
;sleep 200
;sendinput ^v
;sleep 100

; *******************************
; *** Only if WoW is in focus ***
; *******************************
#IfWinActive, World of Warcraft

; *** Makes clones jump with main ***
~Space::ClonesPush("{Space}=")

~^1::ClonesPush("-^1")

~3::ClonesPush("-3")

~F12::ClonesPush("{F12}")

; *** Suspends HotKeys while typing on main ***
;~Enter::Suspend, Toggle
;~/::Suspend, On
;~Escape::Suspend, Off
#IfWinActive
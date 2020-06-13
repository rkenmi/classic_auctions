/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.rkenmi.classicah.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @author Rick Miyamoto
 */
@Controller // <1>
public class HomeController {

	@Autowired
    private HomeController() {

	}

	@RequestMapping(value = {"/"})
	public String index(Model model) {
		model.addAttribute("title", ": Home");
		return "index";
	}

	@RequestMapping(value = {"/about"})
	public String about(Model model) {
		model.addAttribute("title", ": About");
		return "index";
	}

	@RequestMapping(value = {"/privacy"})
	public String privacyPolicy(Model model) {
		model.addAttribute("title", ": Privacy Policy");
		return "index";
	}

	@RequestMapping(value = {"/search"})
	public String search(
			@RequestParam("q") String query,
			@RequestParam(name = "p", defaultValue = "0") Integer page,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction,
			@RequestParam(name = "pS", defaultValue = "15") Integer pageSize,
			@RequestParam(name = "sortField", required = false) String sortField,
			@RequestParam(name = "sortFieldOrder", required = false) Integer sortFieldOrder,
			Model model) {
		model.addAttribute("title", String.format(": %s - %s - %s", query, realm, faction));
		return "index";
	}
}

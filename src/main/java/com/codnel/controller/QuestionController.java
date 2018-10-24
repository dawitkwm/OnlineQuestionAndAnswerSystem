package com.codnel.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.codnel.domain.Answer;
import com.codnel.domain.Question;
import com.codnel.service.QuestionService;
import com.codnel.service.TopicService;

@Controller
@RequestMapping("question")
public class QuestionController {

	@Autowired
	QuestionService questionService;

	@Autowired
	TopicService topicService;

	@Autowired
	private SimpMessagingTemplate template;

	@RequestMapping(value = "/add", method = RequestMethod.GET)
	public String getQuestionForm(@ModelAttribute("question") Question question, Model model) {
		model.addAttribute("allTopics", topicService.findAll());
		return "addForm";
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	public String showQuestion(@PathVariable("id") int id, Model model) {
		Question question = questionService.find(id);
		model.addAttribute("question", question);
		List<Answer> answers = question.getAnswers();
		model.addAttribute("answers", answers.stream().distinct().collect(Collectors.toList()));
		return "showQuestion";
	}

	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public String addQuestion(@ModelAttribute("question") Question question) {
		questionService.saveQuestion(question);
		// Send message to the channel to update the question list
		template.convertAndSend("/topic/question/add", question);
		System.out.println("added question" + question.getId());
		return "redirect:/question/" + question.getId();

	}

	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	public String listQuestions(Model model) {
		List<Question> questions = questionService.getAllQuestions();
		model.addAttribute("questions", questions);
		return "/question/list";
	}

	@RequestMapping(value = "/voteUp/{id}", method = RequestMethod.GET)
	@ResponseBody
	public Question voteUpQuestion(@PathVariable("id") Integer id) {
		Question q = questionService.find(id);
		if(q != null) {
			q.setVotes(q.getVotes() + 1);
			questionService.updateQuestion(q);
		}
		template.convertAndSend("/topic/question/voteUp", q);
		return q;
	}
}

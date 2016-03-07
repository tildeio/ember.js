// import SharedBench from './shared-bench';
import Component from 'ember-views/components/component';
import dataGen from '../../utils/data-gen';
import computed from 'ember-metal/computed';
import { bool, equal, and, or, not } from 'ember-metal/computed_macros';
import alias from 'ember-metal/alias';
import { get } from 'ember-metal/property_get';
import Benchmark from '../../utils/benchmarks';
import Mixin from 'ember-metal/mixin';

function endTrace() {
  // just before paint
  requestAnimationFrame(function () {
    // after paint
    requestAnimationFrame(function () {
      document.location.href = "about:blank";
    });
  });
}

export default Benchmark.create('@ember-htmlbars initial render', {
  setup() {

    const FeedGenericUpdate = Component.extend({
      componentType: computed(function() {
        return `voy-${this.get('model.type')}`;
      }),
      componentClassNames: computed(function() {
        return `update-${this.get('model.type')}`;
      })
    });

    this.registerComponent('feed-generic-update', { ComponentClass: FeedGenericUpdate, template: `
      {{#if isDetailView}}
      {{component componentType
                  likeAction=likeAction
                  model=model
                  isDetailed=true}}
      {{else}}
        {{component componentType
                  likeAction=likeAction
                  model=model}}
      {{/if}}
    `});

    const FollowButton = Component.extend({
      tagName: 'button',
      click() {
        this.attrs.toggleFollow();
      }
    });

    this.registerComponent('follow-button', { ComponentClass: FollowButton, template: `
      {{#if isFollowing}}
        Unfollow
      {{else}}
        Follow
      {{/if}}
    `});

    const actorModelToRoute = {
      'entities/shared/mini-company': {
        route: 'entities-company',
        title: 'company_actor'
      },
      'entities/shared/mini-school': {
        route: 'entities-school',
        title: 'school_actor'
      },
      'identity/shared/mini-profile': {
        route: 'profile.view',
        title: 'member_actor'
      }
    };

    const containsURLRegex = /https?:\S+/;

    const VoyMainContent = Component.extend({
      annotatedText: computed(function() {
        let textValues = this.get('text.values');

        if (!textValues) {
          return [];
        }

        let annotatedText = [];

        for (let i = 0; i < textValues.length; i++) {
          let annotatedString = textValues.objectAt(i);
          let value = get(annotatedString, 'value');

          // Converts links in the text to actual links
          let url = containsURLRegex.exec(value);
          if (url) {
            // Push plain text ("check out") onto stack
            if (url.index) {
              annotatedText.push({value: value.substr(0, url.index)});
            }

            // Push the URL onto the stack
            annotatedText.push({
              value: url[0],
              url: url[0]
            });

            value = value.substr(url.index + url[0].length);

            // Push the remaining plain text, if any
            if (value) {
              annotatedText.push({value});
            }
          } else {
            let result = {
              id: get(annotatedString, 'entity.id'),
              value: value,
              route: null,
              title: null
            };

            let entityData = actorModelToRoute[get(annotatedString, 'entity.name')];
            if (entityData) {
              result.route = entityData.route;
              result.title = entityData.title;
            }
            annotatedText.push(result);
          }
        }

        return annotatedText;
      })
    });

    this.registerComponent('voy-main-content', { ComponentClass: VoyMainContent, template: `
      {{#each annotatedText as |stringObj|}}
        {{#if stringObj}}
          {{stringObj.value}}
        {{/if}}
      {{/each}}
    `});

    const VoyHero = Component.extend({
      hasTitle: bool('content.title'),
      hasSubtitle: bool('content.subtitle'),
      shouldShowContent: or('hasTitle', 'hasSubtitle'),
      noHeroImage: not('content.image'),
      isArticle: equal('content.contentType', 'article'),
      isImage: equal('content.contentType', 'image'),
      isVideo: equal('content.contentType', 'video')
    });

    this.registerComponent('voy-hero', { ComponentClass: VoyHero, template: `
       {{#unless noHeroImage}}
        {{#if isVideo}}
        {{else if isArticle}}
        {{else if isImage}}
          {{voy-avatar-image altText=content.title image=content.image}}
        {{/if}}
      {{/unless}}

      {{#if shouldShowContent}}
        {{#unless noHeroImage}}
          {{voy-hero-desc content=content}}
        {{/unless}}
      {{/if}}
    `});

    const VoyHeroDesc = Component.extend({});

    this.registerComponent('voy-hero-desc', { ComponentClass: VoyHeroDesc, template: `
    {{#if content.title}}
      <h2 class="image-headline">{{content.title}}</h2>
    {{/if}}

    {{#if content.subtitle}}
      <h3 class="image-byline">{{content.subtitle}}</h3>
    {{/if}}
    `});

    const InlineShowMore = Component.extend({});

    this.registerComponent('inline-show-more-text', { ComponentClass: InlineShowMore, template: `
      {{yield}}
    `});

    const VoyLikeBtn = Component.extend({});

    this.registerComponent('voy-like-btn', { ComponentClass: VoyLikeBtn, template: `
    {{#svg-icon}}
      <span>Like</span>
    {{/svg-icon}}
    `});

    const VoyCommentBtn = Component.extend({});

    this.registerComponent('voy-comment-btn', { ComponentClass: VoyCommentBtn, template: `
    {{#svg-icon}}
      <span>Comment</span>
    {{/svg-icon}}
    `});

    const VoyReshareBtn = Component.extend({});

    this.registerComponent('voy-reshare-btn', { ComponentClass: VoyReshareBtn, template: `
    {{#svg-icon}}
      <span>Reshare</span>
    {{/svg-icon}}
    `});

    const VoySocialCounts = Component.extend({});

    this.registerComponent('voy-social-counts', { ComponentClass: VoySocialCounts, template: `
      {{if likes (concat likes ' Likes') }} {{if comments (concat comments ' Comments') }}
    `});

    const SvgIcon = Component.extend({});

    this.registerComponent('svg-icon', { ComponentClass: SvgIcon, template: `
      {{yield}}
    `});

    const VoyActionBar = Component.extend({
      actions: {
        like(id, update) {
          this.sendAction(this.get('like'), id, update);
        }
      }
    });

    this.registerComponent('voy-action-bar', { ComponentClass: VoyActionBar, template: `
      {{voy-like-btn tagName="button"}}
      {{voy-comment-btn tagName="button"}}
      {{voy-reshare-btn tagName="button"}}
      {{voy-social-counts tagName="span"}}
    `});

    const VoyNoHero = Component.extend({});

    this.registerComponent('voy-no-hero', { ComponentClass: VoyNoHero, template: `
      {{yield}}
    `});

    const VoyCustomImage = Component.extend();

    this.registerComponent('voy-custom-image', { ComponentClass: VoyCustomImage, template: `
      <img src="{{image}}" alt="{{altText}}">
    `});

    const VoyLazyImage = Component.extend();

    this.registerComponent('voy-lazy-image', { ComponentClass: VoyLazyImage, template: `
      <img src="{{image}}" alt="{{altText}}">
    `});

    const VoyAvatarImage = Component.extend();

    this.registerComponent('voy-avatar-image', { ComponentClass: VoyAvatarImage, template: `
      {{#if liveLoad}}
        {{voy-lazy-image altText=altText image=image}}
      {{else}}
        {{voy-custom-image altText=altText image=image}}
      {{/if}}
    `});

    const VoyPostMeta = Component.extend({
      hideFollowInterface: false,
      showFollowing: computed('isFollowing', 'hideFollowInterface', function() {
        //Only companies and schools should show the "Following" headline
        return !this.get('hideFollowInterface') && this.get('isFollowing');
      }),
      viralLike: equal('model.viralType', 'like'),
      viralComment: equal('model.viralType', 'comment'),
      isFollowing: bool('actor.followingInfo.following'),

      showDate: computed('model.createdTime', 'showFollowing', function() {
        return !this.get('showFollowing') && this.get('model.createdTime');
      })
    });

    this.registerComponent('voy-post-meta', { ComponentClass: VoyPostMeta, template: `
      {{#if isSponsored}}
        <span>Sponsored</span>
      {{/if}}

      {{#if model.actor.image}}
        {{voy-avatar-image class="actor-image" image=model.actor.image}}
      {{/if}}

      <h3 class="actor">
        <span class="name">
          {{model.actor.fullName}}
          {{#if isInfluencer}}
            <span class="influencer-badge">
              {{fullName}} is a LinkedIn Influencer
            </span>
          {{/if}}
        </span>
        {{#if viralComment}}
          Commented
          {{else if viralLike}}
          Liked
        {{/if}}
      </h3>

      {{#if showFollowing}}
      <div class="top-bar-meta">
        {{follow-button isFollowing=isFollowing}}
      </div>
      {{/if}}
    `});

    const VoyTopBar = Component.extend({
      classNames: ['top-bar'],
      sponsoredDisplayFormat: alias('model.tracking.sponsoredTracking.supportedDisplayFormat'),
      sponsoredLabelTopBar: equal('sponsoredDisplayFormat', 'fssu_vmobile_sulabel_topbar')
    });

    this.registerComponent('voy-top-bar', { ComponentClass: VoyTopBar, template: `
      {{#if someLix}}
      {{voy-post-meta classNames="top-bar"
        model=model
        someLix=someLix
        isSponsored=sponsoredLabelTopBar
        actor=model.actor}}
      {{else}}
      {{voy-post-meta classNames="top-bar"
        model=model
        isSponsored=sponsoredLabelTopBar
        actor=model.actor}}
      {{/if}}
    `});

    const genericMixin = Mixin.create({
      tagName: 'article',
      classNames: ['artdeco-container-card'],
      hasComments: or('model.socialDetail.comments.elements.length'),
      hasHighlightedComment: bool('model.highlightedComments.length'),
      showCommentsList: computed('hasComments', 'hasHighlightedComment', 'isDetailView', function() {
        return (this.get('isDetailView') && this.get('hasComments')) || (!this.get('isDetailView') && this.get('hasHighlightedComment'));
      })
    });

    const VoyViralUpdate = Component.extend(genericMixin,{
      hasImage: bool('model.content.image'),
      isShareVideo: equal('model.type', 'video'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareArticle', 'isShareVideoImage'),
      displayImageDescription: or('isShareArticle', 'isShareVideoImage'),
      noHeroImage: computed('hasImage', 'isShareArticle', 'isShareVideoImage', function() {
        return ((this.get('isShareArticle') && !this.get('hasImage')) || (this.get('isShareVideoImage') && !this.get('hasImage')));
      }),
      displayContentBlock: or('hasHeroEntity', 'noHeroImage', 'displayImageDescription', 'model.type'),
      actions: {
        like() {
          this.sendAction(this.get('likeAction'));
        }
      }
    });

    const VoyProfileUpdate = Component.extend(genericMixin, {
      hasImage: bool('model.content.image'),
      isShareVideo: equal('model.type', 'video'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareArticle', 'isShareVideoImage'),
      displayImageDescription: or('isShareArticle', 'isShareVideoImage'),
      noHeroImage: computed('hasImage', 'isShareArticle', 'isShareVideoImage', function() {
        return ((this.get('isShareArticle') && !this.get('hasImage')) || (this.get('isShareVideoImage') && !this.get('hasImage')));
      }),
      displayContentBlock: or('hasHeroEntity', 'noHeroImage', 'displayImageDescription', 'model.type'),
      actions: {
        like() {
          this.sendAction(this.get('likeAction'));
        }
      }
    });

    this.registerComponent('voy-profile-update', { ComponentClass: VoyProfileUpdate, template: `
    {{#unless isDetailView}}
      {{#if model.actor}}
        {{voy-top-bar classNames="top-bar" model=model}}
      {{/if}}
    {{/unless}}

    {{#if displayContentBlock}}
      <div class="update-content">
        {{#inline-show-more-text}}
          {{voy-main-content text=model.content.text}}
        {{/inline-show-more-text}}
        {{#if hasHeroEntity}}
          {{voy-hero classNames='hero-content'
                    content=model.content}}
        {{else if noHeroImage}}
          {{voy-no-hero}}
        {{/if}}
      </div>
    {{/if}}

    {{voy-action-bar classNames='action-bar' like=likeAction model=model}}

    {{#if isDetailView}}
        {{voy-action-bar classNames='action-bar' like=likeAction model=model}}
    {{/if}}

    {{#if showCommentsList}}{{/if}}
    `});

    const VoySponsoredUpdate = Component.extend(genericMixin, {
      hasSponsoredText: bool('model.content.text'),
      hasImage: bool('model.content.image'),
      isShareArticle: equal('model.content.contentType', 'article'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareVideo: equal('model.content.contentType', 'video'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareVideoImage', 'isShareArticleImage'),
      displayContentBlock: or('hasSponsoredText', 'hasHeroEntity', 'noHeroImage', 'displayImageDescription'),
      displayImageDescription:computed(function() {
        return (this.get('isShareArticle') || this.get('isShareVideo')) && !this.get('noHeroImage');
      }),
      noHeroImage: computed('isShareArticle', 'isShareVideo', 'hasImage', function(){
        return ((this.get('isShareArticle') && !this.get('hasImage')) ||
                (this.get('isShareVideo') && !this.get('hasImage')));
      })
    });

    this.registerComponent('voy-sponsored-update', { ComponentClass: VoySponsoredUpdate, template: `
    {{#unless isDetailView}}
      {{#if model.actor}}
        {{voy-top-bar classNames="top-bar" model=model}}
      {{/if}}
    {{/unless}}

    {{#if displayContentBlock}}
      <div class="update-content">
        {{#if hasSponsoredText}}
          {{#inline-show-more-text}}
            {{voy-main-content text=model.content.text}}
          {{/inline-show-more-text}}
        {{/if}}
        {{#if hasHeroEntity}}
          {{voy-hero classNames='hero-content'
                    content=model.content}}
        {{else if noHeroImage}}
          {{voy-no-hero}}
        {{/if}}
      </div>
    {{/if}}

    {{voy-action-bar classNames='action-bar' like=likeAction model=model}}

    {{#if showCommentsList}}{{/if}}
    `});

    this.registerComponent('voy-viral-update', { ComponentClass: VoyViralUpdate, template: `
      {{#unless isDetailView}}
        {{#if model.actor}}
          {{voy-top-bar classNames="top-bar" model=model}}
        {{/if}}
      {{/unless}}

      {{#if displayContentBlock}}
        <div class="update-content">
          {{#inline-show-more-text}}
            {{voy-main-content text=model.content.text}}
          {{/inline-show-more-text}}
          {{#if hasHeroEntity}}
            {{voy-hero classNames='hero-content'
                      content=model.content}}
          {{else if noHeroImage}}
            {{voy-no-hero}}
          {{/if}}
        </div>
      {{/if}}

      {{voy-action-bar classNames='action-bar' like=likeAction model=model}}

      {{#if isDetailView}}
        {{voy-action-bar classNames='action-bar' like=likeAction model=model}}
      {{/if}}

      {{#if showCommentsList}}{{/if}}
    `});

    this.registerTopLevelTemplate(`
      <ul class="feed" id="feed">
        {{#each model as |updates|}}
          {{#each updates as |update|}}
            <li class="update">{{feed-generic-update
            likeAction="like"
            model=update}}</li>
          {{/each}}
        {{/each}}
      </ul>
    `);
  },

  start() {
    this.render({ model: [dataGen(20)] });
    this.perf.mark('renderEnd');
    endTrace();
  }
});
